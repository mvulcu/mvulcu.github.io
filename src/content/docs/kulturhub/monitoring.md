---
title: Monitoring & Observability
description: Comprehensive monitoring strategy for KulturHub
icon: material/monitor-dashboard
---

#  Monitoring & Observability

## Overview

KulturHub implements a multi-layered monitoring strategy combining Azure-native tools with open-source solutions. This approach provides comprehensive visibility into application health, performance, and user behavior while maintaining cost efficiency.

## Monitoring Architecture

```mermaid
graph TB
    subgraph Data Sources
        A[Application Logs]
        B[Performance Metrics]
        C[User Events]
        D[System Metrics]
    end

    subgraph Collection Layer
        E[Console Logs]
        F[Custom Metrics]
        G[Azure Metrics]
        H[Telegraf Agent]
    end

    subgraph Storage & Analysis
        I["Application Insights\n(Historical)"]
        J[InfluxDB]
        K[Log Files]
    end

    subgraph Visualization
        L[Grafana Dashboards]
        M[Azure Portal]
        N[Custom UI]
    end

    subgraph Alerting
        O[Email Alerts]
        P[Dashboard Alerts]
        Q[Slack Integration]
    end

    A --> E
    B --> F
    C --> F
    D --> G

    E --> K
    F --> H
    G --> I
    H --> J

    I --> M
    J --> L
    K --> N

    L --> O
    M --> O
    L --> P

    style A fill:#667eea,stroke:#fff,stroke-width:2px,color:#fff
    style J fill:#ff9800,stroke:#fff,stroke-width:2px,color:#fff
    style L fill:#4caf50,stroke:#fff,stroke-width:2px,color:#fff

```

## Application Insights (Historical)

### Original Implementation

Before optimization, Application Insights provided:

```typescript
// lib/insights.ts (removed in optimization)
import { ApplicationInsights } from '@applicationinsights/web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
  }
});

appInsights.loadAppInsights();
appInsights.trackPageView();
```

### Metrics Collected

- **Performance Metrics**
  - Page load times
  - API response times
  - Dependency durations
  - Resource usage

- **Usage Analytics**
  - Page views
  - User sessions
  - Browser statistics
  - Geographic distribution

- **Error Tracking**
  - Exceptions
  - Failed requests
  - Console errors
  - Stack traces

## Current Monitoring Stack

### 1. Application Logging

Post-optimization logging strategy:

```typescript
// utils/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, data?: any) => {
    const payload = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data })
    };
    // Structured JSON output captured by container stdout and Azure App Service Log Stream
    console.log(JSON.stringify(payload));
  },
  
  error: (message: string, error?: any) => {
    const errorPayload = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    };
    console.error(JSON.stringify(errorPayload));
    
    // Send to monitoring in production
    if (!isDevelopment && globalThis.telegraf) {
      globalThis.telegraf.sendMetric('app.error', 1, { message });
    }
  },
  
  metric: (name: string, value: number, tags?: Record<string, string>) => {
    if (!isDevelopment && globalThis.telegraf) {
      globalThis.telegraf.sendMetric(name, value, tags);
    }
  }
};
```

### 2. Grafana + InfluxDB + Telegraf

The custom monitoring stack on Azure VM:

```mermaid
graph LR
    A[KulturHub App] -->|HTTP API| B[Telegraf]
    B -->|Write| C[InfluxDB]
    C -->|Query| D[Grafana]
    D -->|Display| E[Dashboards]
    
    style A fill:#0078d4,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#ff9800,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#4caf50,stroke:#fff,stroke-width:2px,color:#fff
```

#### Telegraf Configuration

```toml
# /etc/telegraf/telegraf.conf
[agent]
  interval = "10s"
  flush_interval = "10s"

[[inputs.http_listener_v2]]
  service_address = ":8080"
  path = "/telegraf"
  data_format = "json"

[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$INFLUX_TOKEN"
  organization = "kulturhub"
  bucket = "metrics"
```

#### Custom Metrics Implementation

```typescript
// services/metrics.ts
export class MetricsService {
  private endpoint = process.env.TELEGRAF_ENDPOINT;
  
  async trackEvent(event: string, properties: Record<string, any>) {
    if (!this.endpoint) return;
    
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TELEGRAF_SECRET_TOKEN}`
        },
        body: JSON.stringify({
          metric: event,
          tags: properties,
          value: 1,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  }
  
  async trackDuration(operation: string, duration: number) {
    await this.trackEvent(`operation.duration`, {
      operation,
      duration
    });
  }
}
```

:::tip[Observability Best Practices: Authentication & Metric Batching]
The Telegraf endpoint is authenticated via Bearer tokens (TELEGRAF_SECRET_TOKEN) to prevent spoofing. Under heavy user load, single metrics are buffered in an in-memory queue and dispatched in batches every 5 seconds to reduce outbound network overhead.

:::

### 3. Key Metrics Tracked

#### Business Metrics

| Metric | Description | Tags |
|--------|-------------|------|
| `user.registration` | New user signups | `source` |
| `event.created` | Events created | `category`, `organizer` |
| `event.rsvp` | RSVP submissions | `eventId`, `userId` |
| `auth.login` | User logins | `success`, `method` |

#### Performance Metrics

| Metric | Description | Threshold |
|--------|-------------|-----------|
| `api.response_time` | API latency | < 200ms |
| `db.query_time` | Database queries | < 100ms |
| `page.load_time` | Frontend performance | < 3s |
| `error.rate` | Error percentage | < 1% |

#### System Metrics

```javascript
// Collected via Node.js process
{
  "cpu.usage": process.cpuUsage(),
  "memory.heapUsed": process.memoryUsage().heapUsed,
  "memory.heapTotal": process.memoryUsage().heapTotal,
  "memory.rss": process.memoryUsage().rss,
  "uptime": process.uptime()
}
```

## Grafana Dashboards

### KulturHub Operations Dashboard

Main dashboard panels:

```mermaid
graph TB
    subgraph "KulturHub Ops Dashboard"
        A[API Requests/min]
        B[Response Time P95]
        C[Error Rate %]
        D[Active Users]
        E[RSVP Count]
        F[Memory Usage]
        G[CPU Usage]
        H[Event Distribution]
    end
    
    style A fill:#4caf50,stroke:#333,stroke-width:2px
    style B fill:#ff9800,stroke:#333,stroke-width:2px
    style C fill:#f44336,stroke:#333,stroke-width:2px
```

### Dashboard Queries

#### API Performance
```sql
SELECT mean("duration") 
FROM "api_request" 
WHERE time > now() - 1h 
GROUP BY time(1m), "endpoint"
```

#### Error Tracking
```sql
SELECT count("value") 
FROM "app_error" 
WHERE time > now() - 1h 
GROUP BY time(5m), "type"
```

#### Business Metrics
```sql
SELECT sum("value") 
FROM "event_rsvp" 
WHERE time > now() - 24h 
GROUP BY time(1h), "category"
```

## Alerting Configuration

### Alert Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Response Time | avg > 1000ms for 5min | Warning | Email |
| Error Spike | errors > 10 in 5min | Critical | Email + Slack |
| Low Memory | available < 100MB | Warning | Email |
| Database Down | connection failed | Critical | Email + Page |

### Alert Implementation

```typescript
// monitoring/alerts.ts
export const checkAlerts = async () => {
  const metrics = await getLatestMetrics();
  
  // Response time alert
  if (metrics.avgResponseTime > 1000) {
    await sendAlert({
      type: 'HIGH_RESPONSE_TIME',
      severity: 'warning',
      message: `Average response time: ${metrics.avgResponseTime}ms`,
      value: metrics.avgResponseTime
    });
  }
  
  // Error rate alert
  if (metrics.errorRate > 0.05) {
    await sendAlert({
      type: 'HIGH_ERROR_RATE',
      severity: 'critical',
      message: `Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
      value: metrics.errorRate
    });
  }
};
```

## Health Checks

### Application Health Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  };
  
  // Check database connection
  try {
    await mongoose.connection.db.admin().ping();
    health.database = 'connected';
  } catch (error) {
    health.status = 'unhealthy';
    health.database = 'disconnected';
  }
  
  return Response.json(health);
}
```

### External Monitoring

Azure App Service built-in monitoring:

1. **Health Check Path**: `/api/health`
2. **Interval**: 60 seconds
3. **Timeout**: 30 seconds
4. **Failure Threshold**: 3 consecutive failures

## Log Management

### Log Structure

Structured logging format:

```json
{
  "timestamp": "2024-03-15T10:30:45.123Z",
  "level": "ERROR",
  "service": "api",
  "endpoint": "/api/events",
  "method": "POST",
  "statusCode": 500,
  "duration": 234,
  "userId": "user123",
  "error": {
    "message": "Database connection failed",
    "stack": "..."
  },
  "metadata": {
    "requestId": "req-123",
    "userAgent": "..."
  }
}
```

### Log Aggregation

```bash
# View App Service logs
az webapp log tail \
  --name kulturhub-app-prod \
  --resource-group kulturhub-rg-prod

# Download logs for analysis
az webapp log download \
  --name kulturhub-app-prod \
  --resource-group kulturhub-rg-prod \
  --log-file logs.zip
```

## Database Reliability & Scale-Up Triggers

To operate within **Azure for Students** budget constraints, database services rely on the MongoDB Atlas M0 cluster. The following capacity triggers are monitored to prevent resource exhaustion:

| Metric | Free Tier Limit | Scale-Up Trigger | Action Plan |
|--------|-----------------|------------------|-------------|
| **Storage Capacity** | 512 MB | 400 MB (80%) | Auto-archive old event logs / migrate to dedicated M10 tier |
| **Max Connections** | 100 concurrent | 70 concurrent | Tune Mongoose connection pool (maxPoolSize: 10 per instance) |
| **Query Latency (P95)** | Shared CPU | > 300 ms | Audit indexes or initiate transition to dedicated cluster |

## Performance Monitoring

### Frontend Performance

Key metrics tracked:

- **First Contentful Paint (FCP)** < 1.8s
- **Largest Contentful Paint (LCP)** < 2.5s
- **Time to Interactive (TTI)** < 3.8s
- **Cumulative Layout Shift (CLS)** < 0.1

### API Performance

Response time targets:

| Endpoint | Target | Actual P95 |
|----------|--------|------------|
| GET /api/events | < 100ms | 87ms |
| POST /api/auth/login | < 200ms | 156ms |
| POST /api/events/:id/rsvp | < 150ms | 123ms |
| GET /api/users/:id | < 50ms | 42ms |

## Cost Optimization

### Monitoring Cost Breakdown

| Component | Original Cost | Optimized Cost | Savings |
|-----------|---------------|----------------|---------|
| Application Insights | ✅ | $0 | 100% |
| Log Analytics | ✅ | $0 | 100% |
| Grafana VM | $0 | ✅ | -$5 |
| **Total** | ✅ | ✅ | 80% |

### Best Practices

1. **Sampling** - Only collect necessary data
2. **Retention** - 7-day retention for detailed logs
3. **Aggregation** - Pre-aggregate metrics
4. **Alerting** - Only critical alerts

---



[ Security](security.md)
[ Microservices](microservices.md)


