import PropTypes from 'prop-types';
import { SessionProvider } from 'next-auth/react'
import '@styles/globals.css'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    return (
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    )
}

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.shape({
        session: PropTypes.object,
    }).isRequired,
};

export default MyApp;