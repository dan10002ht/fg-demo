"use client";

/* ─── Sidebar navigation data ─── */
const NAV_MAIN = [
  { label: "Home", icon: "home" },
  { label: "Orders", icon: "orders", badge: "30" },
  { label: "Products", icon: "products" },
  { label: "Customers", icon: "customers" },
  { label: "Marketing", icon: "marketing" },
  { label: "Discounts", icon: "discounts" },
  { label: "Content", icon: "content" },
  { label: "Markets", icon: "markets" },
  { label: "Analytics", icon: "analytics" },
];

const NAV_SALES_CHANNELS = [
  { label: "Online Store", icon: "store", href: "/" },
  { label: "Point of Sale", icon: "pos" },
  { label: "Inbox", icon: "inbox" },
];

const NAV_APPS = [
  {
    label: "Demo Free Gift",
    icon: "app-gift",
    subItems: [{ label: "Campaigns", id: "campaigns" }],
  },
];

/* ─── SVG Icons ─── */
function NavIcon({ type }) {
  const s = 20;
  const c = "currentColor";

  switch (type) {
    case "home":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M10 2.5L2.5 8.5V17.5H7.5V12.5H12.5V17.5H17.5V8.5L10 2.5Z" stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "orders":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="2" stroke={c} strokeWidth="1.5" />
          <path d="M7 6H13M7 10H13M7 14H10" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "products":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M3 6L10 2L17 6V14L10 18L3 14V6Z" stroke={c} strokeWidth="1.5" />
          <path d="M3 6L10 10M10 10L17 6M10 10V18" stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "customers":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke={c} strokeWidth="1.5" />
          <path d="M3.5 17.5C3.5 14 6.5 11.5 10 11.5C13.5 11.5 16.5 14 16.5 17.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "marketing":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M3 14L3 8L14 4V18L3 14Z" stroke={c} strokeWidth="1.5" />
          <path d="M14 9H17M14 13H16" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "discounts":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <circle cx="7" cy="7" r="1.5" stroke={c} strokeWidth="1.5" />
          <circle cx="13" cy="13" r="1.5" stroke={c} strokeWidth="1.5" />
          <path d="M15 5L5 15" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="2" y="2" width="16" height="16" rx="3" stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "content":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="14" height="14" rx="2" stroke={c} strokeWidth="1.5" />
          <path d="M6 7H14M6 10H14M6 13H10" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "markets":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" />
          <path d="M3 10H17M10 2.5C12 5 12.5 7.5 12.5 10C12.5 12.5 12 15 10 17.5M10 2.5C8 5 7.5 7.5 7.5 10C7.5 12.5 8 15 10 17.5" stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "analytics":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <path d="M3 17V11L7 8L11 12L17 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "store":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="8" width="14" height="10" rx="1" stroke={c} strokeWidth="1.5" />
          <path d="M3 8L5 3H15L17 8" stroke={c} strokeWidth="1.5" />
          <rect x="8" y="12" width="4" height="6" stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "pos":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <rect x="4" y="2" width="12" height="16" rx="2" stroke={c} strokeWidth="1.5" />
          <circle cx="10" cy="14" r="1.5" stroke={c} strokeWidth="1.5" />
          <path d="M7 5H13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "inbox":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4" width="16" height="12" rx="2" stroke={c} strokeWidth="1.5" />
          <path d="M2 7L10 12L18 7" stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "settings":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="3" stroke={c} strokeWidth="1.5" />
          <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.7 4.3L14.3 5.7M5.7 14.3L4.3 15.7M15.7 15.7L14.3 14.3M5.7 5.7L4.3 4.3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "app-gift":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="8" width="14" height="10" rx="1.5" stroke={c} strokeWidth="1.5" />
          <path d="M3 11H17" stroke={c} strokeWidth="1.5" />
          <path d="M10 8V18" stroke={c} strokeWidth="1.5" />
          <path d="M10 8C10 8 7 8 6 6.5C5 5 6.5 3.5 8 4.5C9 5.2 10 8 10 8Z" stroke={c} strokeWidth="1.5" />
          <path d="M10 8C10 8 13 8 14 6.5C15 5 13.5 3.5 12 4.5C11 5.2 10 8 10 8Z" stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "app-joy":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" />
          <circle cx="7.5" cy="8.5" r="1" fill={c} />
          <circle cx="12.5" cy="8.5" r="1" fill={c} />
          <path d="M7 12.5C8 13.5 12 13.5 13 12.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
          <rect x="11" y="11" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
        </svg>
      );
  }
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
      <path d="M4.5 3L7.5 6L4.5 9" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Shopify Logo ─── */
function ShopifyLogo() {
  return (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
      <path
        d="M20.89 5.47C20.87 5.34 20.76 5.27 20.67 5.26C20.58 5.25 18.93 5.18 18.93 5.18C18.93 5.18 17.37 3.65 17.19 3.47C17.01 3.29 16.67 3.35 16.54 3.38C16.54 3.38 16.27 3.46 15.82 3.6C15.74 3.34 15.62 3.02 15.43 2.7C14.87 1.74 14.03 1.24 13.02 1.24C12.93 1.24 12.83 1.24 12.74 1.26C12.7 1.2 12.65 1.15 12.61 1.1C12.17 0.64 11.62 0.42 10.98 0.44C9.76 0.48 8.55 1.36 7.57 2.84C6.87 3.91 6.34 5.24 6.18 6.27C4.73 6.72 3.72 7.03 3.7 7.04C3.02 7.25 3 7.27 2.92 7.91C2.86 8.4 1 23.19 1 23.19L16.75 26L23 24.42C23 24.42 20.91 5.61 20.89 5.47Z"
        fill="#95BF47"
      />
      <path
        d="M20.67 5.26C20.58 5.25 18.93 5.18 18.93 5.18C18.93 5.18 17.37 3.65 17.19 3.47C17.12 3.4 17.03 3.37 16.93 3.35L16.75 26L23 24.42C23 24.42 20.91 5.6 20.89 5.47C20.87 5.34 20.76 5.27 20.67 5.26Z"
        fill="#5E8E3E"
      />
      <path
        d="M13.02 9.33L12.28 12.1C12.28 12.1 11.45 11.72 10.46 11.78C9.01 11.87 9.01 12.78 9.01 13C9.08 13.88 12.35 14.16 12.53 17.03C12.67 19.3 11.29 20.86 9.33 20.99C6.97 21.14 5.68 19.76 5.68 19.76L6.17 17.53C6.17 17.53 7.47 18.52 8.52 18.46C9.2 18.42 9.44 17.87 9.42 17.48C9.33 16.34 6.67 16.44 6.51 13.81C6.37 11.6 7.79 9.37 11.07 9.15C12.33 9.07 12.97 9.33 12.97 9.33"
        fill="white"
      />
    </svg>
  );
}

/* ─── Nav Item ─── */
function SidebarItem({ item, activePage, onClick }) {
  const hasActiveSub = item.subItems?.some((sub) => sub.id === activePage);
  const isAppSelf = activePage === "app" && item.subItems?.length > 0;
  // Expand sub-items when the app itself or any sub-item is active
  const isExpanded = item.subItems && (hasActiveSub || isAppSelf);
  // Highlight the app row only on "app" (list view), not when a sub-item is active
  const isActive = item.active || (isAppSelf && !hasActiveSub);

  return (
    <>
      <a
        href={item.href || "#"}
        onClick={(e) => {
          if (item.href) return;
          e.preventDefault();
          if (onClick) onClick(item);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          margin: "1px 6px",
          fontSize: 13.5,
          color: "#303030",
          cursor: "pointer",
          borderRadius: 8,
          textDecoration: "none",
          background: isActive ? "#fafafa" : "transparent",
          fontWeight: isActive ? 600 : 400,
          lineHeight: "20px",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "#e0e0e0";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{ display: "flex", flexShrink: 0, color: "#616161" }}>
          <NavIcon type={item.icon} />
        </span>
        <span
          style={{
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: 600,
            fontSize: "14px"
          }}
        >
          {item.label}
        </span>
        {item.badge && (
          <span
            style={{
              fontSize: 12,
              color: "#616161",
              background: "#dcdcdc",
              padding: "0 8px",
              borderRadius: 10,
              fontWeight: 500,
              lineHeight: "20px",
            }}
          >
            {item.badge}
          </span>
        )}
      </a>
      {/* Sub items */}
      {isExpanded && item.subItems && (
        <div style={{ marginLeft: 36, marginTop: 1 }}>
          {item.subItems.map((sub) => {
            const subActive = sub.id === activePage;
            return (
              <div
                key={sub.id}
                style={{
                  fontSize: 13,
                  color: "#303030",
                  padding: "5px 8px",
                  margin: "1px 8px",
                  borderRadius: 8,
                  background: subActive ? "#fafafa" : "transparent",
                  fontWeight: subActive ? 600 : 400,
                  cursor: "default",
                  transition: "background 0.1s",
                }}
              >
                {sub.label}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ─── Section Heading ─── */
function SectionHeading({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: 12,
        color: "#616161",
        padding: "10px 16px 4px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
      <Chevron />
    </div>
  );
}

/* ─── Main Shell ─── */
export default function ShopifyAdminShell({ children, activePage = "campaigns" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "#f1f1f1",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      {/* ── Top Bar ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          height: 56,
          background: "#1a1a1a",
          padding: "0 12px",
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", width: 220, paddingLeft: 4 }}>
          <ShopifyLogo />
        </div>

        {/* Search */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              maxWidth: 580,
              height: 36,
              padding: "0 12px",
              background: "#303030",
              borderRadius: 8,
              border: "1px solid #505050",
              cursor: "text",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="5.5" stroke="#8c8c8c" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#8c8c8c" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ color: "#8c8c8c", fontSize: 13 }}>Search</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  color: "#777",
                  background: "#252525",
                  padding: "2px 6px",
                  borderRadius: 4,
                  border: "1px solid #444",
                }}
              >
                CTRL
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#777",
                  background: "#252525",
                  padding: "2px 6px",
                  borderRadius: 4,
                  border: "1px solid #444",
                }}
              >
                K
              </span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          {/* Store icon */}
          <div style={{ cursor: "pointer", display: "flex", padding: 6, borderRadius: 8 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="8" width="14" height="10" rx="1" stroke="#b0b0b0" strokeWidth="1.5" />
              <path d="M3 8L5 3H15L17 8" stroke="#b0b0b0" strokeWidth="1.5" />
            </svg>
          </div>
          {/* Bell icon */}
          <div style={{ cursor: "pointer", display: "flex", padding: 6, borderRadius: 8 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3C7.24 3 5 5.24 5 8V11L3 14H17L15 11V8C15 5.24 12.76 3 10 3Z" stroke="#b0b0b0" strokeWidth="1.5" />
              <path d="M8 14V15C8 16.1 8.9 17 10 17C11.1 17 12 16.1 12 15V14" stroke="#b0b0b0" strokeWidth="1.5" />
            </svg>
          </div>
          {/* Avatar + store name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 8px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#6b5b95",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              AG
            </div>
            <span style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 500 }}>
              {process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace(".myshopify.com", "")}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#999",
                background: "#303030",
                padding: "2px 8px",
                borderRadius: 10,
                border: "1px solid #444",
              }}
            >
              dev
            </span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Sidebar ── */}
        <nav
          style={{
            width: 220,
            background: "#ebebeb",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 0",
            }}
          >
            {/* Main nav */}
            <div style={{ marginBottom: 2 }}>
              {NAV_MAIN.map((item) => (
                <SidebarItem key={item.label} item={item} activePage={activePage} />
              ))}
            </div>

            {/* Sales channels */}
            <SectionHeading label="Sales channels" />
            <div style={{ marginBottom: 2 }}>
              {NAV_SALES_CHANNELS.map((item) => (
                <SidebarItem key={item.label} item={item} activePage={activePage} />
              ))}
            </div>

            {/* Apps */}
            <SectionHeading label="Apps" />
            <div style={{ marginBottom: 2 }}>
              {NAV_APPS.map((item) => (
                <SidebarItem key={item.label} item={item} activePage={activePage} />
              ))}
            </div>
          </div>

          {/* Settings */}
          <div
            style={{
              borderTop: "1px solid #d4d4d4",
              padding: "6px 0",
            }}
          >
            <SidebarItem item={{ label: "Settings", icon: "settings" }} activePage={activePage} />
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main style={{ flex: 1, overflow: "auto", background: "#f1f1f1" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
