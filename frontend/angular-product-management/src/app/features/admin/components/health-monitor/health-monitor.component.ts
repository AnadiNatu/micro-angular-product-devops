import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { HighlightDirective } from '../../../../shared/directives/highlight.directive';
import { CustomCurrencyPipe } from '../../../../shared/pipes/custom-currency.pipe';


interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  uptime: number;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

@Component({
  selector: 'app-health-monitor',
  templateUrl: './health-monitor.component.html',
  styleUrls: ['./health-monitor.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe]
})
export class HealthMonitorComponent implements OnInit, OnDestroy {
  services: ServiceStatus[] = [];
  systemMetrics: SystemMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    activeConnections: 0,
    requestsPerMinute: 0,
    errorRate: 0
  };

  isAutoRefresh: boolean = true;
  lastRefreshTime: Date = new Date();
  private refreshSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeServices();
    this.updateMetrics();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    // IMPORTANT: Cleanup subscription to prevent memory leak
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      console.log('Health monitor auto-refresh stopped');
    }
  }

  /**
   * Initialize mock service statuses
   */
  private initializeServices(): void {
    this.services = [
      {
        name: 'Database',
        status: 'healthy',
        responseTime: 45,
        lastCheck: new Date(),
        uptime: 99.9
      },
      {
        name: 'API Server',
        status: 'healthy',
        responseTime: 120,
        lastCheck: new Date(),
        uptime: 99.5
      },
      {
        name: 'Authentication Service',
        status: 'healthy',
        responseTime: 80,
        lastCheck: new Date(),
        uptime: 100
      },
      {
        name: 'Email Service',
        status: 'degraded',
        responseTime: 350,
        lastCheck: new Date(),
        uptime: 98.2
      },
      {
        name: 'Storage Service',
        status: 'healthy',
        responseTime: 95,
        lastCheck: new Date(),
        uptime: 99.8
      },
      {
        name: 'Cache Server',
        status: 'healthy',
        responseTime: 15,
        lastCheck: new Date(),
        uptime: 99.9
      }
    ];
  }

  /**
   * Update system metrics (mock data)
   */
  private updateMetrics(): void {
    // Generate mock metrics with some randomization
    this.systemMetrics = {
      cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
      memoryUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
      diskUsage: Math.floor(Math.random() * 15) + 45, // 45-60%
      activeConnections: Math.floor(Math.random() * 500) + 100,
      requestsPerMinute: Math.floor(Math.random() * 1000) + 500,
      errorRate: Math.random() * 2 // 0-2%
    };

    // Randomly update service statuses
    this.services = this.services.map(service => ({
      ...service,
      responseTime: Math.floor(Math.random() * 200) + 50,
      lastCheck: new Date(),
      status: Math.random() > 0.9 ? 'degraded' : 'healthy'
    }));

    this.lastRefreshTime = new Date();
  }

  /**
   * Start auto-refresh with interval
   */
  private startAutoRefresh(): void {
    if (this.isAutoRefresh) {
      // Update every 5 seconds
      this.refreshSubscription = interval(5000).subscribe(() => {
        this.updateMetrics();
        console.log('Health metrics refreshed');
      });
    }
  }

  /**
   * Toggle auto-refresh
   */
  toggleAutoRefresh(): void {
    this.isAutoRefresh = !this.isAutoRefresh;

    if (this.isAutoRefresh) {
      this.startAutoRefresh();
    } else {
      if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
      }
    }
  }

  /**
   * Manual refresh
   */
  manualRefresh(): void {
    this.updateMetrics();
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'healthy': 'bg-success',
      'degraded': 'bg-warning text-dark',
      'down': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'healthy': 'bi-check-circle-fill',
      'degraded': 'bi-exclamation-triangle-fill',
      'down': 'bi-x-circle-fill'
    };
    return iconMap[status] || 'bi-question-circle-fill';
  }

  /**
   * Get metric color class
   */
  getMetricColorClass(value: number, thresholds: { warning: number; danger: number }): string {
    if (value >= thresholds.danger) {
      return 'text-danger';
    } else if (value >= thresholds.warning) {
      return 'text-warning';
    }
    return 'text-success';
  }

  /**
   * Get progress bar color
   */
  getProgressBarClass(value: number, thresholds: { warning: number; danger: number }): string {
    if (value >= thresholds.danger) {
      return 'bg-danger';
    } else if (value >= thresholds.warning) {
      return 'bg-warning';
    }
    return 'bg-success';
  }

  /**
   * Calculate overall system health
   */
  getOverallHealth(): { status: string; percentage: number } {
    const healthyCount = this.services.filter(s => s.status === 'healthy').length;
    const percentage = (healthyCount / this.services.length) * 100;
    
    let status = 'Excellent';
    if (percentage < 50) status = 'Critical';
    else if (percentage < 75) status = 'Fair';
    else if (percentage < 90) status = 'Good';

    return { status, percentage };
  }

  /**
   * Navigate back
   */
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}