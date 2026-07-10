package com.quantedge.service;

import com.quantedge.dto.request.CreatePortfolioRequest;
import com.quantedge.dto.request.TradeRequest;
import com.quantedge.dto.response.PortfolioResponse;
import com.quantedge.entity.*;
import com.quantedge.exception.AppException;
import com.quantedge.exception.ErrorCode;
import com.quantedge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Portfolio service â€” manages virtual portfolios, holdings, and paper trades.
 * Per TECH_SPEC.md Â§6 â€” Portfolio & Trading Engine.
 * Per APPFLOW.md â€” Portfolio Module.
 *
 * Business rules:
 *  - Max 5 portfolios per user (PORTFOLIO_LIMIT)
 *  - Must have sufficient cash balance to BUY
 *  - Must have sufficient shares to SELL
 *  - Commission is always â‚¹0 (virtual trading)
 *  - Daily snapshots taken at midnight UTC via ScheduledJobs
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final PortfolioSnapshotRepository snapshotRepository;
    private final MarketDataService marketDataService;
    private final AuditLogRepository auditLogRepository;

    // â”€â”€â”€ Portfolio CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Transactional(readOnly = true)
    public List<Portfolio> getUserPortfolios(String userId) {
        return portfolioRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtAsc(userId);
    }

    @Transactional(readOnly = true)
    public Portfolio getPortfolio(String portfolioId, String userId) {
        return portfolioRepository.findByIdAndUserIdAndIsDeletedFalse(portfolioId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.PORTFOLIO_NOT_FOUND));
    }

    public Portfolio createPortfolio(String userId, CreatePortfolioRequest request) {
        // Enforce 5-portfolio limit
        long count = portfolioRepository.countByUserIdAndIsDeletedFalse(userId);
        if (count >= 5) {
            throw new AppException(ErrorCode.PORTFOLIO_LIMIT);
        }

        // Enforce unique name per user
        if (portfolioRepository.existsByUserIdAndNameAndIsDeletedFalse(userId, request.getName())) {
            throw new AppException(ErrorCode.PORTFOLIO_NAME_TAKEN);
        }

        // Build user reference
        User userRef = User.builder().id(userId).build();  // proxy reference â€” no full load

        BigDecimal initialCapital = request.getInitialCapital() != null
                ? request.getInitialCapital()
                : new BigDecimal("100000.00");

        Portfolio portfolio = Portfolio.builder()
                .user(userRef)
                .name(request.getName().trim())
                .description(request.getDescription())
                .cashBalance(initialCapital)
                .initialCapital(initialCapital)
                .isDefault(count == 0)  // first portfolio is default
                .build();

        portfolio = portfolioRepository.save(portfolio);
        log.info("Portfolio created: {} for user: {}", portfolio.getId(), userId);
        auditLog(userId, portfolio.getId(), AuditLog.AuditAction.PORTFOLIO_CREATE);
        return portfolio;
    }

    public void deletePortfolio(String portfolioId, String userId) {
        Portfolio portfolio = getPortfolio(portfolioId, userId);
        portfolio.setDeleted(true);
        portfolioRepository.save(portfolio);
        auditLog(userId, portfolioId, AuditLog.AuditAction.PORTFOLIO_DELETE);
        log.info("Portfolio soft-deleted: {}", portfolioId);
    }

    // â”€â”€â”€ Trade Execution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Execute a BUY or SELL trade on a portfolio.
     * Validates balance/shares, updates holding, records transaction.
     */
    public Transaction executeTrade(String portfolioId, String userId, TradeRequest request) {
        Portfolio portfolio = getPortfolio(portfolioId, userId);

        // Fetch current market price
        StockQuote quote = marketDataService.getQuote(request.getSymbol().toUpperCase());
        BigDecimal price = request.getLimitPrice() != null
                ? request.getLimitPrice()
                : quote.getPrice();

        BigDecimal shares = request.getShares();
        BigDecimal totalCost = price.multiply(shares).setScale(2, RoundingMode.HALF_UP);

        if (request.getType() == Transaction.TransactionType.BUY) {
            return executeBuy(portfolio, request.getSymbol(), shares, price, totalCost, request.getNotes());
        } else {
            return executeSell(portfolio, request.getSymbol(), shares, price, totalCost, request.getNotes());
        }
    }

    private Transaction executeBuy(Portfolio portfolio, String symbol, BigDecimal shares,
                                    BigDecimal price, BigDecimal totalCost, String notes) {
        // Validate cash
        if (portfolio.getCashBalance().compareTo(totalCost) < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_CASH,
                    String.format("Required: $%.2f | Available: $%.2f",
                            totalCost, portfolio.getCashBalance()));
        }

        // Deduct cash
        portfolio.setCashBalance(portfolio.getCashBalance().subtract(totalCost));
        portfolioRepository.save(portfolio);

        // Update or create holding
        Optional<Holding> existingOpt = holdingRepository.findByPortfolioIdAndSymbol(portfolio.getId(), symbol);
        Holding holding;
        if (existingOpt.isPresent()) {
            holding = existingOpt.get();
            BigDecimal newTotalShares = holding.getShares().add(shares);
            BigDecimal newTotalCost   = holding.getTotalCost().add(totalCost);
            holding.setShares(newTotalShares);
            holding.setAverageCost(newTotalCost.divide(newTotalShares, 4, RoundingMode.HALF_UP));
            holding.setTotalCost(newTotalCost);
        } else {
            holding = Holding.builder()
                    .portfolio(portfolio)
                    .symbol(symbol)
                    .shares(shares)
                    .averageCost(price)
                    .totalCost(totalCost)
                    .build();
        }
        holdingRepository.save(holding);

        // Record transaction
        Transaction tx = Transaction.builder()
                .portfolio(portfolio)
                .symbol(symbol)
                .type(Transaction.TransactionType.BUY)
                .orderType(Transaction.OrderType.MARKET)
                .shares(shares)
                .pricePerShare(price)
                .totalAmount(totalCost)
                .commission(BigDecimal.ZERO)
                .notes(notes)
                .executedAt(Instant.now())
                .build();

        tx = transactionRepository.save(tx);
        auditLog(portfolio.getUser().getId(), portfolio.getId(), AuditLog.AuditAction.TRADE_BUY);
        log.info("BUY executed: {} shares of {} @ ${} in portfolio {}",
                shares, symbol, price, portfolio.getId());
        return tx;
    }

    private Transaction executeSell(Portfolio portfolio, String symbol, BigDecimal shares,
                                     BigDecimal price, BigDecimal totalProceeds, String notes) {
        Holding holding = holdingRepository.findByPortfolioIdAndSymbol(portfolio.getId(), symbol)
                .orElseThrow(() -> new AppException(ErrorCode.INSUFFICIENT_SHARES,
                        "No holding for " + symbol));

        if (holding.getShares().compareTo(shares) < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_SHARES,
                    String.format("Have %.4f shares, trying to sell %.4f", holding.getShares(), shares));
        }

        // Add proceeds to cash
        portfolio.setCashBalance(portfolio.getCashBalance().add(totalProceeds));
        portfolioRepository.save(portfolio);

        // Update or remove holding
        BigDecimal remainingShares = holding.getShares().subtract(shares);
        if (remainingShares.compareTo(BigDecimal.ZERO) <= 0) {
            holdingRepository.delete(holding);
        } else {
            BigDecimal soldCost = holding.getAverageCost().multiply(shares);
            holding.setShares(remainingShares);
            holding.setTotalCost(holding.getTotalCost().subtract(soldCost));
            holdingRepository.save(holding);
        }

        // Record transaction
        Transaction tx = Transaction.builder()
                .portfolio(portfolio)
                .symbol(symbol)
                .type(Transaction.TransactionType.SELL)
                .orderType(Transaction.OrderType.MARKET)
                .shares(shares)
                .pricePerShare(price)
                .totalAmount(totalProceeds)
                .commission(BigDecimal.ZERO)
                .notes(notes)
                .executedAt(Instant.now())
                .build();

        tx = transactionRepository.save(tx);
        auditLog(portfolio.getUser().getId(), portfolio.getId(), AuditLog.AuditAction.TRADE_SELL);
        log.info("SELL executed: {} shares of {} @ ${} in portfolio {}",
                shares, symbol, price, portfolio.getId());
        return tx;
    }

    // â”€â”€â”€ Portfolio Value Calculation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Calculate current total portfolio value.
     * = cash balance + sum(shares * current_price) for all holdings.
     */
    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolioWithValues(String portfolioId, String userId) {
        Portfolio portfolio = getPortfolio(portfolioId, userId);
        List<Holding> holdings = holdingRepository.findByPortfolioId(portfolioId);

        BigDecimal holdingsValue = BigDecimal.ZERO;
        for (Holding h : holdings) {
            try {
                StockQuote q = marketDataService.getQuote(h.getSymbol());
                BigDecimal currentValue = q.getPrice().multiply(h.getShares());
                holdingsValue = holdingsValue.add(currentValue);
            } catch (Exception e) {
                // Use cost as fallback if quote unavailable
                holdingsValue = holdingsValue.add(h.getTotalCost());
            }
        }

        BigDecimal totalValue = portfolio.getCashBalance().add(holdingsValue);
        BigDecimal totalReturn = totalValue.subtract(portfolio.getInitialCapital());
        BigDecimal totalReturnPct = portfolio.getInitialCapital().compareTo(BigDecimal.ZERO) > 0
                ? totalReturn.divide(portfolio.getInitialCapital(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        return PortfolioResponse.builder()
                .portfolio(portfolio)
                .holdings(holdings)
                .totalValue(totalValue)
                .holdingsValue(holdingsValue)
                .cashBalance(portfolio.getCashBalance())
                .totalReturn(totalReturn)
                .totalReturnPct(totalReturnPct)
                .build();
    }

    // â”€â”€â”€ Transaction History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Transaction> getTransactions(
            String portfolioId, String userId,
            org.springframework.data.domain.Pageable pageable) {
        getPortfolio(portfolioId, userId);  // verify ownership
        return transactionRepository.findByPortfolioIdOrderByExecutedAtDesc(portfolioId, pageable);
    }

    // â”€â”€â”€ Private Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void auditLog(String userId, String entityId, AuditLog.AuditAction action) {
        auditLogRepository.save(AuditLog.builder()
                .userId(userId)
                .action(action)
                .entityType("portfolio")
                .entityId(entityId)
                .success(true)
                .build());
    }
}
