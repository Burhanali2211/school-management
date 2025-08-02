import { columns } from '@/app/(dashboard)/list/finance/components/columns';
import { DataTable } from '@/app/(dashboard)/list/finance/components/data-table';
import { UserNav } from '@/app/(dashboard)/list/finance/components/user-nav';
import { Fee } from '@prisma/client';
import Image from 'next/image';

async function getFees(): Promise<Fee[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/api/finance`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch fees');
    }
    
    const fees = await response.json();
    return fees;
  } catch (error) {
    console.error("Error fetching fees:", error);
    return [];
  }
}

export default async function TaskPage() {
  const fees = await getFees();

  return (
    <>
      <div className='md:hidden'>
        <Image
          src='/examples/tasks-light.png'
          width={1280}
          height={998}
          alt='Playground'
          className='block dark:hidden'
        />
        <Image
          src='/examples/tasks-dark.png'
          width={1280}
          height={998}
          alt='Playground'
          className='hidden dark:block'
        />
      </div>
      <div className='hidden h-full flex-1 flex-col space-y-8 p-8 md:flex'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Welcome back!</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <UserNav />
          </div>
        </div>
        <DataTable data={fees} columns={columns} />
      </div>
    </>
  );
}