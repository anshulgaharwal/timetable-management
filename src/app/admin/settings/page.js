// "use client"
// import { useEffect } from "react"
// import { useSession } from "next-auth/react"
// import { useAdmin } from "../../../contexts/AdminContext"
import styles from "./settings.module.css"

export default function SettingsPage() {
  // const { data: session } = useSession()
  // const { setActionButtons } = useAdmin()

  // useEffect(() => {
  //   setActionButtons([{ label: "Logout", onClick: () => signOut() }])
  // }, [])

  return (
    <div className={styles.settingsContainer}>
      <h1>Settingsaaaaa</h1>
    </div>
  )
}
