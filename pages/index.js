// This repo now powers ONLY the Saratoga Shtiebel vote/donation project.
// The bare root should never show the old JK client-portal login, so send
// it to the donation home. (On the saratogashteibel.org host a next.config
// rewrite already serves /saratoga-home here; this covers every other host,
// e.g. the raw *.vercel.app URL.)
export async function getServerSideProps() {
  return { redirect: { destination: '/saratoga-home', permanent: false } }
}

export default function Index() {
  return null
}
