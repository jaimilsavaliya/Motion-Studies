import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HoverMembers from '../components/HoverMembers';
import { hoverMembers } from '../library/hoverMembers';
export default function HoverMembersPreview() {
  const [query]=useSearchParams();
  useEffect(()=>{document.title='Hover Members — Live preview';},[]);
  return <main className="ms-members-preview">
    <HoverMembers teamMembers={hoverMembers} height={query.has('height')?Number(query.get('height')):'100svh'}
      defaultName={query.get('defaultName')??'OUR TEAM'} backgroundColor={query.get('backgroundColor')||'#121212'}
      textColor={query.get('textColor')||'#ffffff'} hoverTextColor={query.get('hoverTextColor')||'#fb2c36'}
      cursorColor={query.get('cursorColor')||'#fb2c36'} showCursor={query.get('showCursor')!=='false'} />
    {!query.has('embed')&&<a className="ms-members-back" href="/components/hover-members">↖ Back to component</a>}
  </main>;
}
