'use client'

import Image from 'next/image'
import FsaiLogoRow from '@assets/FSAI_Logo_Row.svg'

interface PartnerLogoProps {
  className?: string
  width?: number
  height?: number
}

export default function PartnerLogo({
  className,
  width,
  height,
}: PartnerLogoProps) {
  const CustomPartnerLogo: string =
    process.env.NEXT_PUBLIC_CUSTOM_PARTNER_LOGO || FsaiLogoRow

  return (
    <div className={className}>
      <div className="inline-flex items-center justify-center py-4">
        {typeof CustomPartnerLogo === 'string' ? (
          <Image
            src={CustomPartnerLogo.trimEnd()}
            alt="Logo Image"
            width={width ? width : 100}
            height={height ? height : 100}
            style={{
              width: `${width ? width : '100%'}`,
              height: 'auto',
              minWidth: `${width ? width : '156px'}`,
            }}
          />
        ) : (
          <Image
            src={CustomPartnerLogo}
            alt="Custom Partner Logo"
            width={width ? width : 100}
            height={height ? height : 100}
              style={{
                width: `${width ? `${width}px` : '100%'}`,
                height: `${height ? `${height}px` : 'auto'}`,
                minWidth: `${width ? `${width}px` : '100px'}`,
            }}
          />
        )}
      </div>
    </div>
  )
}
