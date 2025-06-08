import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <h5>
          TODO
        </h5>
        <span className="ms-1">&copy; 2025 ToDo App.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <h5>
         ToDo App Footer
        </h5>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
