import "../styles/main.scss";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function App({ Component, pageProps }) {
  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <Component {...pageProps} />
      </main>

      <Footer />
    </div>
  );
}