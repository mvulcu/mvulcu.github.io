---
title: Monitoring Strategy
description: Comprehensive monitoring setup with real-time dashboards, Azure Functions, and Application Insights
icon: material/monitor-dashboard
---

#  Monitoring Strategy for DevOps Portfolio



-   📊  __Real-time Dashboard__

    ---

    Live metrics visualization directly on the portfolio's main page showing health, performance, and usage data

    [ View Components](#frontend-live-dashboard)

-    __Health Check API__

    ---

    Custom Azure Function providing centralized metrics endpoint with system health indicators

    [ Explore API](#health-check-api-evolution)



##  Overview

:::note[Platform Evolution - Azure to GCP Migration]
This monitoring documentation covers both the original Azure-based monitoring setup and the current GCP implementation.

**Migration Status:** The project was successfully migrated from Azure to GCP in October 2024.

[ View Full Migration Journey](migration.md)

:::

:::tip[Monitoring Architecture Evolution]
The monitoring strategy demonstrates practical cloud monitoring across both platforms:

- **Real-time Health Status** - Visible health metrics on the main page
- **Performance Metrics** - Track latency, memory, and resource usage  
- **Platform Migration** - Azure Functions → GCP Cloud Run monitoring
- **Usage Analytics** - User interactions with privacy-first approach

:::

```mermaid
graph TB
    subgraph "Frontend"
        A[Portfolio App]
        B[Live Dashboard]
        C[Analytics SDK]
    end
    
    subgraph "Backend Services"
        D[Health Check API]
        E[Azure Function]
        F[App Service Health]
    end
    
    subgraph "Monitoring Platform"
        G[Application Insights]
        H[Metrics Store]
        I[Alert Engine]
    end
    
    A --> B
    B -->|15s interval| D
    A --> C
    C -->|Telemetry| G
    D --> E
    E -->|Process Metrics| D
    F -->|Health Status| G
    G --> H
    G --> I
    
    style A fill:#667eea,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style D fill:#00bcd4,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style G fill:#ff6b6b,stroke:#ffffff,stroke-width:2px,color:#ffffff
```

##  Components

### Frontend Live Dashboard

:::note[Real-time Metrics Visualization]
Integrated monitoring component displaying live system health directly on the portfolio

:::

**Technical Details:**

#### Implementation
    ```yaml
    Location: /components/monitoring.tsx
    Library: Recharts for data visualization
    Update: Every 15 seconds via API polling
    State: React hooks for data management
    ```

#### Visualizations
    - **Uptime Gauge** - Service availability percentage
    - **Latency Meter** - Response time in milliseconds
    - **Memory Chart** - Heap usage with percentage
    - **Trend Graphs** - Historical data (last 30 points)

#### Features
    - Auto-refresh with loading states
    - Error handling and retry logic
    - Responsive design for all devices
    - Smooth animations and transitions

### Health Check API Evolution

#### Current: GCP Cloud Run

:::tip[Cloud Run Health Metrics]
    
    **Platform:** Google Cloud Run (current)
    **Technology:** Node.js containerized service
    **Benefits:** Better cold starts, serverless scaling

:::

#### Legacy: Azure Functions

:::note[Azure Function Health Check API (Legacy)]
    
    **Endpoint:** `https://portfolio-function-monitoring.azurewebsites.net/api/healthcheck`
    **Technology:** Node.js Azure Function
    **Status:** Migrated to GCP in October 2024



:::

 **API Response**
: JSON formatted health metrics

 **Response Time**
: < 100ms average latency

🛡️  **Availability**
: 99.9% uptime SLA

 **Update Rate**
: Real-time on request



#### Metrics Exposed

| Metric | Type | Description |
|--------|------|-------------|
| `status` | String | Service health: "ok" or "error" |
| `uptime` | Number | Process uptime in seconds |
| `latency` | Number | Simulated response time (0-100ms) |
| `memory` | Object | Heap usage statistics |
| `cpu` | Object | CPU usage (user/system) |
| `usersOnline` | Number | Active users (demo value) |
| `errors` | Number | Error count (currently 0) |
| `timestamp` | String | ISO timestamp |
| `hostname` | String | Function instance ID |
| `environment` | String | Runtime environment |

### Next.js Application Health Endpoint

:::tip[Native Health Check Integration]
Built-in endpoint for Azure App Service health monitoring

:::

```mermaid
sequenceDiagram
    participant Azure as Azure Health Monitor
    participant App as Next.js App
    participant Endpoint as /api/health
    
    Azure->>App: Health Check Request
    App->>Endpoint: Route to Handler
    Endpoint->>Endpoint: Gather Metrics
    Endpoint->>App: Return Status
    App->>Azure: HTTP 200 + JSON
    
    Note over Azure: Update Service Health
```

**Endpoint Details:**<br>
- **Path:** `/api/health`<br>
- **Method:** GET<br>
- **Response:** JSON with process metrics<br>
- **Purpose:** Azure's built-in health checks

### Monitoring Platform Evolution

#### Current: GCP Cloud Monitoring

:::tip[Google Cloud Monitoring & Logging]
    Built-in observability with Cloud Run integration
    
    **Features:**
    - Container metrics and logs
    - Real-time monitoring
    - Distributed tracing support
    - Cost-effective pricing

:::

#### Legacy: Azure Application Insights

:::note[Azure Application Insights (Legacy)]
    Full-stack monitoring from client interactions to server performance
    
    **Status:** Replaced with GCP Cloud Monitoring during migration



:::

-    __APM Features__

    ---
    
    - Server response times
    - Request rates & failures
    - Dependency tracking
    - Exception logging

-    __Frontend Analytics__

    ---
    
    - Page view tracking
    - User sessions
    - Browser metrics
    - Custom events

-    __Privacy Controls__

    ---
    
    - Cookie consent integration
    - Anonymized user data
    - GDPR compliance
    - Opt-out mechanisms



##  Metrics Collected

### System Metrics

#### Performance
    ```yaml
    Uptime:
      - Process runtime
      - Service availability
      - Restart frequency
    
    Latency:
      - API response times
      - Page load duration
      - Database queries
    
    Throughput:
      - Requests per second
      - Concurrent users
      - Data transfer rates
    ```

#### Resources
    ```yaml
    Memory:
      - Heap usage
      - Total allocated
      - Garbage collection
    
    CPU:
      - User time
      - System time
      - Load average
    
    Storage:
      - Disk usage
      - I/O operations
      - Cache hits
    ```

#### Application
    ```yaml
    Errors:
      - Exception count
      - Error rates
      - Stack traces
    
    Business:
      - Page views
      - User sessions
      - Feature usage
    
    Custom:
      - Cookie consent
      - Navigation patterns
      - API calls
    ```

##  Data Flow

:::tip[End-to-End Monitoring Pipeline]

:::

```mermaid
flowchart LR
    subgraph "Data Collection"
        A[Frontend Dashboard]
        B[Health API]
        C[App Telemetry]
    end
    
    subgraph "Processing"
        D[Azure Function]
        E[App Insights SDK]
        F[Metrics Aggregation]
    end
    
    subgraph "Storage & Analysis"
        G[Time Series DB]
        H[Log Analytics]
        I[Query Engine]
    end
    
    A -->|15s Poll| B
    B --> D
    C --> E
    D --> F
    E --> F
    F --> G
    F --> H
    G --> I
    H --> I
    
    style A fill:#9333ea,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#0891b2,stroke:#fff,stroke-width:2px,color:#fff
    style G fill:#dc2626,stroke:#fff,stroke-width:2px,color:#fff
```

### Data Flow Steps

1. **Frontend Dashboard** polls Health Check API every 15 seconds
2. **Azure Function** gathers process metrics and returns JSON
3. **Application** sends telemetry to Application Insights
4. **Insights Platform** processes and stores metrics
5. **Analytics Engine** enables queries and visualizations

##  Alerting Strategy

:::caution[Production Alert Configuration]
While not fully automated in this demo, production systems should implement:

:::

### Alert Types



 **Performance Alerts**
: High latency, slow queries, memory pressure

 **Availability Alerts**
: Service down, health check failures, timeouts

 **Error Alerts**
: Exception spikes, 5xx errors, critical logs

 **Capacity Alerts**
: Resource limits, scaling triggers, quotas



### Alert Channels

#### Email Notifications
    - Immediate alerts for critical issues
    - Daily/weekly summary reports
    - Stakeholder distribution lists

#### Teams/Slack Integration
    - Real-time notifications in channels
    - Interactive alert management
    - Incident collaboration

#### PagerDuty/On-Call
    - 24/7 critical alerts
    - Escalation policies
    - Incident tracking

## 🚀  Future Enhancements

:::note[Roadmap for Advanced Monitoring]

:::

### Planned Improvements

- [ ] **Distributed Tracing** - End-to-end request tracking across services
- [ ] **Advanced Health Checks** - Database connectivity, dependency validation
- [ ] **Time-Series Database** - Prometheus/InfluxDB for long-term storage
- [ ] **Grafana Dashboards** - Custom visualization and alerting
- [ ] **SLO/SLI Tracking** - Service level objectives and indicators
- [ ] **Chaos Engineering** - Resilience testing and monitoring
- [ ] **ML Anomaly Detection** - Predictive alerting and trend analysis

### Integration Opportunities

```mermaid
graph LR
    A[Current Setup] --> B[Enhanced Platform]
    
    B --> C[Prometheus]
    B --> D[Grafana]
    B --> E[ELK Stack]
    B --> F[Jaeger]
    
    C --> G[Advanced Metrics]
    D --> G
    E --> H[Log Analysis]
    F --> I[Distributed Tracing]
    
    style A fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#3b82f6,stroke:#fff,stroke-width:2px,color:#fff
```

## 🛡️  Best Practices Applied

:::tip[Monitoring Implementation Guidelines]

:::

- ✅ **Privacy First** - Cookie consent and data anonymization
- ✅ **Performance Impact** - Minimal overhead on application
- ✅ **Error Handling** - Graceful degradation if monitoring fails
- ✅ **Cost Optimization** - Efficient data retention policies
- ✅ **Security** - No sensitive data in metrics
- ✅ **Accessibility** - Dashboard works with screen readers
- ✅ **Documentation** - Clear metric definitions

---



**Part of the DevOps Portfolio project by Maria Vulcu**

[ Azure Deployment (Legacy)](deployment.md)
[ Migration Journey](migration.md)
[ Back to Home](index.md)

