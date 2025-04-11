import { useState } from "react"
import styles from "./Arena.module.css"

import MainCharacter from "../../components/MainCharacter"
import BottomMenu from "../../components/BottomMenu"
import Pets from "../../components/Pets"
import Header from "../../components/Header"

const Arena = () => {
  const [count, setCount] = useState(0)

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.mainContent}>
        {/* Логотип */}
        <div className={styles.logoWrapper}>
          <div className={styles.logoPlaceholder}>Logo</div>
        </div>

        <MainCharacter />
        <Pets />

        <div className={styles.counterWrapper}>
          <button className={styles.counterButton} onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </button>
        </div>
      </main>

      <BottomMenu />
    </div>
  )
}

export default Arena
