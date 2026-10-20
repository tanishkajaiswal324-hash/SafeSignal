package com.safesignal.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SafetyReportRepository
        extends JpaRepository<SafetyReport, Long> {
}