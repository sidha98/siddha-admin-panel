import React from 'react'
import Dashboard from './components/dashboard/Dashboard'
import DealersData from './components/dealers'
import ExtractionData from './components/extraction'
import ModelData from './components/modelData'
import Orders from './components/orders/Orders'
import Profile from './components/profile'
import Sales_Data from './components/salesData'
import SegmentData from './components/segmentTarget'
import Users from './components/users'
import { element } from 'prop-types'
import DealerTable from './components/dealerTseWise'
import DealerCreditLimit from './components/dealerCreditLimit'
import Employee from './components/employee'
import TallyTable from './components/tallyTranscation'

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/orders', name: 'Orders', element: Orders },
  { path: '/extraction', name: 'Extraction', element: ExtractionData },
  { path: '/users', name: 'Users', element: Users },
  { path: '/salesData', name: 'Sales Data', element: Sales_Data },
  { path: '/segment', name: 'Segment Data', element: SegmentData },
  { path: '/dealers', name: 'Dealers Data', element: DealersData },
  { path: '/model', name: 'Model Data', element: ModelData },
  { path: '/dealertsewise', name: 'Dealer List TSE', element: DealerTable },
  { path: '/dealer-credit-limit', name: 'Dealer List TSE', element: DealerCreditLimit },
  { path: '/profile', name: 'Profile', element: Profile  },
  { path: '/employees', name: 'Employees', element: Employee  },
  { path: '/tally-transaction', name: 'Tally Transaction', element: TallyTable  },
]

export default routes
