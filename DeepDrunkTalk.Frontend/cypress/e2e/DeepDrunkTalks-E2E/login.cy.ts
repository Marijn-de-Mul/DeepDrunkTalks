describe('Login Page', () => {
  beforeEach(() => {
    cy.viewport("iphone-xr");
    cy.visit('http://localhost:5173/login');
  });

  it('should display the login form', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').contains('LOGIN').should('be.visible');
    cy.get('a').contains('REGISTER INSTEAD').should('be.visible');
  });

  it('should allow the user to type email and password', () => {
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('password123');
    
    cy.get('input[type="email"]').should('have.value', 'user@example.com');
    cy.get('input[type="password"]').should('have.value', 'password123');
  });

  it('should show error if credentials are wrong', () => {
    cy.intercept('POST', 'https://localhost:7108/api/users/login', {
      statusCode: 400,
      body: { message: 'Invalid credentials' },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('wronguser@example.com');
    cy.get('input[type="password"]').type('wrongpassword');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    cy.get('p').should('contain.text', 'Invalid credentials').and('be.visible');
  });

  it('should redirect to homepage after successful login', () => {
    cy.intercept('POST', 'https://localhost:7108/api/users/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('password123');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    cy.url().should('eq', 'http://localhost:3000/'); 

    cy.get('h1').should('contain.text', 'Welcome');
  });
});
