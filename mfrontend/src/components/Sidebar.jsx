import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <nav>
        <ul>
          <li className="sidebar-item">
            <NavLink
              to="/databases"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              Databases
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink
              to="/query"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              Query Converter
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink
              to="/create-database"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              Create Database
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;