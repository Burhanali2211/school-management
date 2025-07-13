import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lamaSkyLight">
      <div className="text-center">
        <div className="mb-8">
          <Image src="/logo.png" alt="SchooLama" width={64} height={64} className="mx-auto" />
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
