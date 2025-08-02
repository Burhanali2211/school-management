import { render, screen } from '@testing-library/react'
import ParentsPageClient from './ParentsPageClient'

const mockData = [
  {
    id: '1',
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    img: null,
    createdAt: new Date(),
    students: []
  }
]

describe('ParentsPageClient', () => {
  it('renders without crashing', () => {
    render(
      <ParentsPageClient
        data={mockData}
        isAdmin={true}
        totalParents={1}
        parentsWithChildren={0}
        totalChildren={0}
        averageChildrenPerParent={0}
      />
    )
    
    expect(screen.getByText('Parents Management')).toBeInTheDocument()
  })
})