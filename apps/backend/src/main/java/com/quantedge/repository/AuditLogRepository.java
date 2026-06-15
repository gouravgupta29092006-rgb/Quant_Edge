package com.quantedge.repository;

import com.quantedge.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    Page<AuditLog> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Page<AuditLog> findByActionOrderByCreatedAtDesc(AuditLog.AuditAction action, Pageable pageable);
}
