import { Fragment } from 'react';
import { Link } from 'react-router';

export type BreadcrumbItem = {
  label: string;
  href?: string;
  active?: boolean;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 && <span className="nav-sep">/</span>}
          {renderItem(item)}
        </Fragment>
      ))}
    </>
  );
}

function renderItem(item: BreadcrumbItem) {
  if (item.active) {
    return <span className="nav-crumb-active">{item.label}</span>;
  }
  if (item.href) {
    return (
      <Link to={item.href} className="nav-crumb">
        {item.label}
      </Link>
    );
  }
  return <span className="nav-crumb">{item.label}</span>;
}
