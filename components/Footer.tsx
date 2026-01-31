
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-8 text-center text-slate-500 text-sm border-t border-slate-800">
      <p>© {new Date().getFullYear()} Conan Modding Tools • Built for TOT ! Admin Mod users</p>
    </footer>
  );
};

export default Footer;
