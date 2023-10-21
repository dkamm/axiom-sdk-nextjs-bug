import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { Axiom } from "@axiom-crypto/core";
import { ethers } from 'ethers';
import { useEffect } from 'react';

const providerUri = `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
const config = {
  providerUri,
  version: "v1",
  chainId: 5, // Goerli; defaults to 1 (Ethereum Mainnet)
  mock: true, // builds proofs without utilizing actual Prover resources
}
const axiomClient = new Axiom(config);

const checkStorageVerified = async (blockNumber, address, slot, value) => {
  const qb = axiomClient.newQueryBuilder()
  await qb.append({
    blockNumber,
    address,
    slot,
    value
  });
  const {keccakQueryResponse} = await qb.build();
  const responseTree = await axiomClient.query.getResponseTreeForKeccakQueryResponse(
    keccakQueryResponse
  );
  const keccakStorageResponse = responseTree.storageTree.getHexRoot();
  const storageWitness = axiomClient.query.getValidationWitness(
    responseTree,
    blockNumber,
    address,
    slot,
  );
  const provider = new ethers.JsonRpcProvider(providerUri);
  const axiomV1Query = new ethers.Contract(
    axiomClient.getAxiomQueryAddress(), 
    axiomClient.getAxiomQueryAbi(), 
    provider
  );
  const responsesValid = await axiomV1Query.areResponsesValid(
    null,
    null,
    keccakStorageResponse,
    [],
    [],
    [storageWitness]
  );
  return responsesValid;
}

export default function Home() {

  useEffect(() => {
    const slot = 4 + 7;
    const address = "0x03D842bDC4C06d3F095b13e2Aa48DBC629C2253C";
    const blockNumber = 9902537;
    const value = "0x5dec166a787077123691d26315519d1aa42d469408e1812f42c8cd6665f36975";
    const checker = async () => {
      console.log("storage verified?", await checkStorageVerified(blockNumber, address, slot, value));
    }
    checker(); 
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing <code>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel" className={styles.logo} />
        </a>
      </footer>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
