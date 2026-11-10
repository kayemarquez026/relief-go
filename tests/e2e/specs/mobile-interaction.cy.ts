/// <reference types="cypress" />

/**
 * Regression checks for the Ionic mobile viewport.
 * These are browser checks; real Android WebView gesture behavior still
 * needs a physical-device verification.
 */
const cases = [
  { url: '/welcome', content: '.welcome-content' },
  { url: '/login', content: '.login-content' },
  { url: '/register', content: '.register-content' },
  { url: '/campaigns', content: '.campaigns-content' },
];

function assertCanScroll(contentSelector: string): void {
  cy.get(contentSelector, { timeout: 15000 }).should('be.visible').then(($content) => {
    // The additional height is intentional: check the Ionic scroll mechanism
    // independently of how much live data happens to be on the page.
    const probe = $content[0].ownerDocument.createElement('div');
    probe.setAttribute('data-scroll-probe', '');
    probe.style.cssText = 'height: 1400px; width: 1px; pointer-events: none;';
    $content[0].appendChild(probe);
  });

  cy.get(contentSelector).shadow().find('[part="scroll"]').should(($scroll) => {
    const element = $scroll[0] as HTMLElement;
    expect(element.scrollHeight, 'scrollable document height')
      .to.be.greaterThan(element.clientHeight + 100);
  });

  cy.get(contentSelector).shadow().find('[part="scroll"]')
    .scrollTo('bottom', { duration: 0 })
    .should(($scroll) => {
      expect(($scroll[0] as HTMLElement).scrollTop, 'Ionic scrollTop').to.be.greaterThan(50);
    });
}

describe('ReliefGO mobile scrolling and taps', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
    cy.intercept('GET', '**/api/campaigns*', { statusCode: 200, body: [] });
  });

  cases.forEach(({ url, content }) => {
    it(`scrolls in mobile viewport on ${url}`, () => {
      cy.visit(url, {
        onBeforeLoad(win) {
          win.localStorage.removeItem('reliefgo_pg_token');
        },
      });
      assertCanScroll(content);
    });
  });

  it('lets the user tap the login email field', () => {
    cy.visit('/login');
    cy.get('#login-email').should('be.visible').click().should('be.focused');
  });

  it('lets the user navigate to campaigns by tapping a visible link', () => {
    cy.visit('/welcome');
    cy.get('.welcome-page .menu-toggle').should('be.visible').click();
    cy.get('.welcome-page .desktop-nav.nav-open a[href="/campaigns"]')
      .should('be.visible')
      .click();
    cy.location('pathname').should('eq', '/campaigns');
  });

  it('keeps dashboard scrolling usable after closing the member menu', () => {
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: {
        id: 'd3c53404-ecde-4308-b41b-63a70c07e852',
        name: 'Test Mobile User',
        email: 'mobile-smoke@example.com',
        phone: '09123456789',
        role: 'donor',
        is_suspended: false
      }
    });
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        win.localStorage.setItem('reliefgo_pg_token', 'mobile-smoke-token');
      },
    });
    cy.get('.member-menu-toggle', { timeout: 15000 }).should('be.visible').click();
    cy.get('.member-menu-backdrop').should('be.visible').click('right');
    cy.get('.member-menu-backdrop').should('not.exist');
    assertCanScroll('.dashboard-content');
  });
});
