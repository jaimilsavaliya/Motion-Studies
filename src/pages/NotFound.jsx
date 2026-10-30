import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export default function NotFound() { return <div className="ms-not-found"><span className="ms-page-eyebrow">404 / A MOMENT MISSING</span><h1>Nothing here. Yet.</h1><p>This page or component doesn’t exist in the collection.</p><Link to="/components" className="ms-button primary"><ArrowLeft size={14} /> Back to components</Link></div>; }
