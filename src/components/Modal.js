"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import styles from "./Modal.module.css"

/**
 * A reusable modal component with glassmorphic styling
 *
 * @param {boolean} isOpen - Controls whether the modal is displayed
 * @param {function} onClose - Function called when the modal should close
 * @param {string} title - Title displayed in the modal header
 * @param {ReactNode} children - Content to display in the modal body
 * @param {string} size - Size of the modal: 'small', 'medium', or 'large'
 * @param {ReactNode} footer - Content to display in the modal footer
 * @param {object} footerButtons - Optional configuration for standard footer buttons
 * @param {object} footerButtons.confirm - Configuration for confirm button
 * @param {string} footerButtons.confirm.text - Text for confirm button
 * @param {function} footerButtons.confirm.onClick - Click handler for confirm button
 * @param {object} footerButtons.cancel - Configuration for cancel button
 * @param {string} footerButtons.cancel.text - Text for cancel button
 * @param {function} footerButtons.cancel.onClick - Click handler for cancel button
 */
export default function Modal({ isOpen, onClose, title, children, size = "medium", footer = null, footerButtons = null }) {
  const modalRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden" // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto" // Restore scrolling
    }
  }, [isOpen, onClose])

  // Close when clicking outside the modal
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose()
    }
  }

  // Generate standard footer buttons if provided
  const renderFooterButtons = () => {
    if (!footerButtons) return null

    return (
      <>
        {footerButtons.cancel && <button onClick={footerButtons.cancel.onClick || onClose}>{footerButtons.cancel.text || "Cancel"}</button>}
        {footerButtons.confirm && (
          <button className={styles.primary} onClick={footerButtons.confirm.onClick}>
            {footerButtons.confirm.text || "Confirm"}
          </button>
        )}
      </>
    )
  }

  if (!isOpen) return null

  // Only render the portal on the client side
  if (!mounted) return null

  // Use createPortal to render the modal at the document body level
  return createPortal(
    <div className={styles.modalOverlay} onClick={handleOutsideClick}>
      <div ref={modalRef} className={`${styles.modalContent} ${styles[size]}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {(footer || footerButtons) && <div className={styles.modalFooter}>{footer || renderFooterButtons()}</div>}
      </div>
    </div>,
    document.body
  )
}
