import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import Category from "./Category";

import Journal from "./Journal";

function App() {
  return (
    <Router>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <NavLink className="text-white nav-link" to="/">
          Money Journey
        </NavLink>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <NavLink className="nav-link" to="/journal">
              Journal
            </NavLink>
            <NavLink className="nav-link" to="/category">
              Category
            </NavLink>
            {/* <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown> */}
          </Nav>
          {/* <Nav>
            <Nav.Link href="#deets">More deets</Nav.Link>
            <Nav.Link eventKey={2} href="#memes">
              Sign Out
            </Nav.Link>
          </Nav> */}
        </Navbar.Collapse>
      </Navbar>

      <Switch>
        <Route path="/journal">
          <Journal />
        </Route>
        <Route path="/category">
          <Category />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

function CategoryManagement() {
  return <h1>Category Management</h1>;
}

function Home() {
  return <h1 class="col-lg-1 col-centered">Home is under maintainance</h1>;
}
export default App;