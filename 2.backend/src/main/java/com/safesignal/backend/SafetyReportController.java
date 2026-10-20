
package com.safesignal.backend;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class SafetyReportController {

    private final SafetyReportRepository repository;

    public SafetyReportController(SafetyReportRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestBody SafetyReport report) {

        if (report.getCategory() == null
                || report.getCategory().isBlank()
                || report.getLocation() == null
                || report.getLocation().isBlank()
                || report.getDetails() == null
                || report.getDetails().isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "Category, location and details are required.")
            );
        }

        report.setStatus("PENDING_VERIFICATION");

        SafetyReport savedReport = repository.save(report);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedReport);
    }

    @GetMapping
    public List<SafetyReport> getReports() {
        return repository.findAll();
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<?> verifyReport(@PathVariable Long id) {

        Optional<SafetyReport> optionalReport =
                repository.findById(id);

        if (optionalReport.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Report not found."));
        }

        SafetyReport report = optionalReport.get();
        report.setStatus("VERIFIED");

        SafetyReport updatedReport = repository.save(report);

        return ResponseEntity.ok(updatedReport);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectReport(@PathVariable Long id) {

        Optional<SafetyReport> optionalReport =
                repository.findById(id);

        if (optionalReport.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Report not found."));
        }

        SafetyReport report = optionalReport.get();
        report.setStatus("REJECTED");

        SafetyReport updatedReport = repository.save(report);

        return ResponseEntity.ok(updatedReport);
    }
}
