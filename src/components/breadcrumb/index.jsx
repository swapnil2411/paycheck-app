import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ labels = {} }) => {
  const location = useLocation();

  const pathnames = location.pathname
    .split('/')
    .filter(Boolean);

  // ❌ Don't show breadcrumb on Home page
  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumbs">
      <ul>
        {/* Home (only when not on /) */}
        <li className="default_link">
          <img src='/images/home.png' alt='Home '/>
          <Link to="/">Home</Link>
        </li>

        {pathnames.map((path, index) => {
          const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
          const isLast = index === pathnames.length - 1;
          const label = labels[path] || path.replace(/-/g, ' ');

          return (
            <li
              key={routeTo}
              className={isLast ? 'current-page' : 'middle-page'}
            >
              <span className="separator"> / </span>

              {isLast ? (
                <span>{label}</span>
              ) : (
                <Link to={routeTo}>{label}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
