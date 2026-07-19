# SEM brief — Thailand / SEA

## Structure

- **Campaigns by cluster:** AI Transformation · ERP/CRM · Tech Startup Bangkok · Brand (KunanonJ / Manut / GoGoCash)
- **Geo:** Thailand (bid primary); SEA expansion markets with lower bids
- **Language:** EN + TH ad groups where search volume exists
- **Landing pages:** topic hubs + venture hubs (same URLs as organic) with UTMs

## UTM convention

```
utm_source=google
utm_medium=cpc
utm_campaign={cluster}
utm_content={ad_group}
```

Example: `/topics/erp-crm-internal-systems?utm_source=google&utm_medium=cpc&utm_campaign=erp_crm`

## Conversion events (site → GTM → Ads)

| Event name | Trigger |
|------------|---------|
| `contact_cta_click` | Contact / email CTA |
| `venture_outbound_click` | External product URL |
| `newsletter_subscribe` | Existing subscribe API success |
| `topic_hub_cta` | Hub primary CTA |

Configure Google Ads conversions + LinkedIn Insight inside GTM (container `NEXT_PUBLIC_GTM_ID`), not as hardcoded pixels.

## Negatives

See `keyword-map.md` SEM negatives seed. Add job-seeker and freebie intent after first 2 weeks of search terms report.
