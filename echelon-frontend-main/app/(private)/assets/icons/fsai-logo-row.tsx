import FsaiColumnImg from '@assets/FSAI_Logo_Column.svg'
import FsaiRowImg from '@assets/FSAI_Logo_Row.svg'
import Image from 'next/image'

enum FSAILogoType {
  COLUMN = 'column',
  ROW = 'row',
}

interface FsaiLogoProps {
  className?: string
  logoType: FSAILogoType
}

export default function FsaiLogoRow({ className, logoType }: FsaiLogoProps) {
  const FsaiImg = logoType === FSAILogoType.COLUMN ? FsaiColumnImg : FsaiRowImg
  const logoStyle =
    logoType === FSAILogoType.COLUMN
      ? 'justify-center py-4'
      : 'justify-left py-0'
  const logoSize = logoType === FSAILogoType.COLUMN ? '90px' : '140px'

  return (
    <div className={className}>
      <div className={`inline-flex min-w-full items-center ${logoStyle}`}>
        <Image
          src={FsaiImg}
          alt="Fsai Logo image"
          style={{ width: '100%', height: 'auto', maxWidth: logoSize }}
          priority
        />
      </div>
    </div>
  )
}
