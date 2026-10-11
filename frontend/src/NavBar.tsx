import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

const NavBar = () => (
  <nav className="navbar">
    <Link to="/" className="navbar-title">Best Paint Jobs</Link>
    <UserMenu />
  </nav>
);

export default NavBar;
