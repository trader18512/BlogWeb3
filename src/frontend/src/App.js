import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import BlogPosts from "./components/blog/BlogPosts"; // Import your BlogPosts component
import "./App.css";
import Wallet from "./components/Wallet";
import coverImg from "./assets/img/cover.jpg";
import { login, logout as destroy } from "./utils/auth";
import Cover from "./components/utils/Cover";
import { Notification } from "./components/utils/Notifications";
import { isAuthenticated, getPrincipalText } from "./utils/auth";
import { icpBalance } from "./utils/ledger";
import { getAddressFromPrincipal, getAllBlogPosts } from "./utils/blog"; // Import your blog utility functions

const App = function AppWrapper() {
    const [authenticated, setAuthenticated] = useState(false);
    const [principal, setPrincipal] = useState('');
    const [balance, setICPBalance] = useState('');
    const [address, setAddress] = useState('');
    const [blogPosts, setBlogPosts] = useState([]);

    const getICPBalance = useCallback(async () => {
        if (authenticated) {
            setICPBalance(await icpBalance());
        }
    }, [authenticated]);

    useEffect(async () => {
        setAuthenticated(await isAuthenticated());
    }, []);

    useEffect(async () => {
        const principal = await getPrincipalText();
        setPrincipal(principal);
    }, []);

    useEffect(() => {
      const fetchData = async () => {
          const principal = await getPrincipalText();
          const account = await getAddressFromPrincipal(principal);
          setAddress(account.account);
      };
  
      fetchData();
  }, [setAddress]);
  

    useEffect(() => {
        getICPBalance();
    }, [getICPBalance]);

    useEffect(() => {
        const fetchBlogPosts = async () => {
            const posts = await getAllBlogPosts();
            setBlogPosts(posts);
        };

        fetchBlogPosts();
    }, []);

    return (
      <>
          <Notification />
          <Container fluid="md">
              <Nav className="justify-content-end pt-3 pb-5">
                  {authenticated ? (
                      <Nav.Item>
                          <Wallet
                              address={address}
                              principal={principal}
                              icpBalance={balance}
                              isAuthenticated={authenticated}
                              destroy={destroy}
                          />
                      </Nav.Item>
                  ) : (
                      <Cover name="My Blog" login={login} coverImg={coverImg} />
                  )}
              </Nav>
              <main>
                  <BlogPosts blogPosts={blogPosts} />
                  <Cover coverImg={coverImg} />
              </main>
          </Container>
      </>
  );
  
};

export default App;
