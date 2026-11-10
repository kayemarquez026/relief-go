describe('ReliefGO welcome route', () => {
  it('loads the original storybook welcome page', () => {
    cy.visit('/welcome');
    cy.contains('ReliefGO');
    cy.contains('EXPLORE CAMPAIGNS');
  });
});
