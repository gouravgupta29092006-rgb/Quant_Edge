package com.quantedge.service;

import com.quantedge.dto.request.TradeRequest;
import com.quantedge.entity.*;
import com.quantedge.exception.AppException;
import com.quantedge.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PortfolioService — trade execution logic.
 * Phase 15 — Per TECH_SPEC.md §15 — Testing Strategy.
 *
 * Key focus: atomic BUY/SELL logic, balance/share checks, average cost.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PortfolioService Unit Tests")
class PortfolioServiceTest {

    @Mock private PortfolioRepository portfolioRepository;
    @Mock private HoldingRepository holdingRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private StockRepository stockRepository;
    @Mock private MarketDataService marketDataService;
    @Mock private AuditLogRepository auditLogRepository;

    @InjectMocks
    private PortfolioService portfolioService;

    private static final String USER_ID      = "user-123";
    private static final String PORTFOLIO_ID = "portfolio-456";

    private Portfolio buildPortfolio(BigDecimal cashBalance) {
        User user = User.builder()
                .id(USER_ID).email("test@test.com")
                .firstName("Test").lastName("User")
                .role(User.UserRole.USER).status(User.UserStatus.ACTIVE)
                .twoFactorEnabled(false).build();
        Portfolio p = new Portfolio();
        p.setId(PORTFOLIO_ID);
        p.setUser(user);
        p.setName("My Portfolio");
        p.setCashBalance(cashBalance);
        p.setInitialCapital(cashBalance);
        // isDeleted defaults to false — portfolio is active
        return p;

    }

    private StockQuote buildQuote(String symbol, BigDecimal price) {
        StockQuote q = new StockQuote();
        q.setSymbol(symbol);
        q.setPrice(price);
        return q;
    }

    // ─── BUY ──────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("executeTrade() — BUY")
    class Buy {

        @Test
        @DisplayName("should deduct cash and create new holding on successful BUY")
        void successfulBuy() {
            Portfolio portfolio = buildPortfolio(new BigDecimal("10000.00"));

            when(portfolioRepository.findByIdAndUserIdAndIsDeletedFalse(PORTFOLIO_ID, USER_ID))
                    .thenReturn(Optional.of(portfolio));
            when(marketDataService.getQuote("AAPL")).thenReturn(buildQuote("AAPL", new BigDecimal("150.00")));
            when(holdingRepository.findByPortfolioIdAndSymbol(PORTFOLIO_ID, "AAPL"))
                    .thenReturn(Optional.empty());
            when(holdingRepository.save(any(Holding.class))).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
            when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));
            when(auditLogRepository.save(any())).thenReturn(null);

            TradeRequest req = new TradeRequest();
            req.setSymbol("AAPL");
            req.setShares(new BigDecimal("10"));
            req.setType(Transaction.TransactionType.BUY);

            portfolioService.executeTrade(PORTFOLIO_ID, USER_ID, req);

            // Cash: 10000 - (150 * 10) = 8500
            assertThat(portfolio.getCashBalance()).isEqualByComparingTo(new BigDecimal("8500.00"));
            verify(holdingRepository).save(any(Holding.class));
            verify(transactionRepository).save(any(Transaction.class));
        }

        @Test
        @DisplayName("should throw INSUFFICIENT_CASH when cash is too low")
        void insufficientCashThrows() {
            Portfolio portfolio = buildPortfolio(new BigDecimal("100.00")); // only $100

            when(portfolioRepository.findByIdAndUserIdAndIsDeletedFalse(PORTFOLIO_ID, USER_ID))
                    .thenReturn(Optional.of(portfolio));
            when(marketDataService.getQuote("AAPL")).thenReturn(buildQuote("AAPL", new BigDecimal("150.00")));

            TradeRequest req = new TradeRequest();
            req.setSymbol("AAPL");
            req.setShares(new BigDecimal("10")); // would cost $1500 but only $100 available
            req.setType(Transaction.TransactionType.BUY);

            assertThatThrownBy(() -> portfolioService.executeTrade(PORTFOLIO_ID, USER_ID, req))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Required");

            verify(portfolioRepository, never()).save(any());
        }

        @Test
        @DisplayName("should compute average cost correctly when adding to existing holding")
        void averageCostOnAdditionalBuy() {
            Portfolio portfolio = buildPortfolio(new BigDecimal("50000.00"));

            // Existing: 10 shares at $100 avg cost, $1000 total cost
            Holding existing = new Holding();
            existing.setSymbol("MSFT");
            existing.setShares(new BigDecimal("10"));
            existing.setAverageCost(new BigDecimal("100.00"));
            existing.setTotalCost(new BigDecimal("1000.00"));

            when(portfolioRepository.findByIdAndUserIdAndIsDeletedFalse(PORTFOLIO_ID, USER_ID))
                    .thenReturn(Optional.of(portfolio));
            when(marketDataService.getQuote("MSFT")).thenReturn(buildQuote("MSFT", new BigDecimal("200.00")));
            when(holdingRepository.findByPortfolioIdAndSymbol(PORTFOLIO_ID, "MSFT"))
                    .thenReturn(Optional.of(existing));
            when(holdingRepository.save(any(Holding.class))).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
            when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));
            when(auditLogRepository.save(any())).thenReturn(null);

            TradeRequest req = new TradeRequest();
            req.setSymbol("MSFT");
            req.setShares(new BigDecimal("10")); // buy 10 more at $200
            req.setType(Transaction.TransactionType.BUY);

            portfolioService.executeTrade(PORTFOLIO_ID, USER_ID, req);

            // avg = (10*100 + 10*200) / 20 = 150
            assertThat(existing.getShares()).isEqualByComparingTo(new BigDecimal("20"));
            assertThat(existing.getAverageCost()).isEqualByComparingTo(new BigDecimal("150.0000"));
        }
    }

    // ─── SELL ─────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("executeTrade() — SELL")
    class Sell {

        @Test
        @DisplayName("should credit cash and reduce holding on successful SELL")
        void successfulSell() {
            Portfolio portfolio = buildPortfolio(new BigDecimal("5000.00"));

            Holding holding = new Holding();
            holding.setSymbol("AAPL");
            holding.setShares(new BigDecimal("20"));
            holding.setAverageCost(new BigDecimal("100.00"));
            holding.setTotalCost(new BigDecimal("2000.00"));

            when(portfolioRepository.findByIdAndUserIdAndIsDeletedFalse(PORTFOLIO_ID, USER_ID))
                    .thenReturn(Optional.of(portfolio));
            when(marketDataService.getQuote("AAPL")).thenReturn(buildQuote("AAPL", new BigDecimal("180.00")));
            when(holdingRepository.findByPortfolioIdAndSymbol(PORTFOLIO_ID, "AAPL"))
                    .thenReturn(Optional.of(holding));
            when(holdingRepository.save(any(Holding.class))).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
            when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));
            when(auditLogRepository.save(any())).thenReturn(null);

            TradeRequest req = new TradeRequest();
            req.setSymbol("AAPL");
            req.setShares(new BigDecimal("5")); // sell 5 shares at $180
            req.setType(Transaction.TransactionType.SELL);

            portfolioService.executeTrade(PORTFOLIO_ID, USER_ID, req);

            // Cash: 5000 + (180 * 5) = 5900
            assertThat(portfolio.getCashBalance()).isEqualByComparingTo(new BigDecimal("5900.00"));
            assertThat(holding.getShares()).isEqualByComparingTo(new BigDecimal("15"));
        }

        @Test
        @DisplayName("should throw INSUFFICIENT_SHARES when selling more than owned")
        void insufficientSharesThrows() {
            Portfolio portfolio = buildPortfolio(new BigDecimal("5000.00"));

            Holding holding = new Holding();
            holding.setSymbol("AAPL");
            holding.setShares(new BigDecimal("3")); // only 3 shares

            when(portfolioRepository.findByIdAndUserIdAndIsDeletedFalse(PORTFOLIO_ID, USER_ID))
                    .thenReturn(Optional.of(portfolio));
            when(marketDataService.getQuote("AAPL")).thenReturn(buildQuote("AAPL", new BigDecimal("150.00")));
            when(holdingRepository.findByPortfolioIdAndSymbol(PORTFOLIO_ID, "AAPL"))
                    .thenReturn(Optional.of(holding));

            TradeRequest req = new TradeRequest();
            req.setSymbol("AAPL");
            req.setShares(new BigDecimal("10")); // trying to sell 10 but only 3 owned
            req.setType(Transaction.TransactionType.SELL);

            assertThatThrownBy(() -> portfolioService.executeTrade(PORTFOLIO_ID, USER_ID, req))
                    .isInstanceOf(AppException.class);

            verify(portfolioRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when selling stock not in holdings")
        void sellingNonExistentHoldingThrows() {
            Portfolio portfolio = buildPortfolio(new BigDecimal("5000.00"));

            when(portfolioRepository.findByIdAndUserIdAndIsDeletedFalse(PORTFOLIO_ID, USER_ID))
                    .thenReturn(Optional.of(portfolio));
            when(marketDataService.getQuote("TSLA")).thenReturn(buildQuote("TSLA", new BigDecimal("200.00")));
            when(holdingRepository.findByPortfolioIdAndSymbol(PORTFOLIO_ID, "TSLA"))
                    .thenReturn(Optional.empty());

            TradeRequest req = new TradeRequest();
            req.setSymbol("TSLA");
            req.setShares(new BigDecimal("1"));
            req.setType(Transaction.TransactionType.SELL);

            assertThatThrownBy(() -> portfolioService.executeTrade(PORTFOLIO_ID, USER_ID, req))
                    .isInstanceOf(AppException.class);
        }
    }

    // ─── getUserPortfolios ────────────────────────────────────────────────────

    @Nested
    @DisplayName("getUserPortfolios()")
    class GetUserPortfolios {

        @Test
        @DisplayName("should return all non-deleted portfolios for user")
        void returnsActivePortfolios() {
            Portfolio p = buildPortfolio(new BigDecimal("100000.00"));
            when(portfolioRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtAsc(USER_ID))
                    .thenReturn(List.of(p));

            List<Portfolio> result = portfolioService.getUserPortfolios(USER_ID);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("My Portfolio");
        }

        @Test
        @DisplayName("should return empty list when user has no portfolios")
        void returnsEmptyForNoPortfolios() {
            when(portfolioRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtAsc(USER_ID))
                    .thenReturn(List.of());

            assertThat(portfolioService.getUserPortfolios(USER_ID)).isEmpty();
        }
    }
}
