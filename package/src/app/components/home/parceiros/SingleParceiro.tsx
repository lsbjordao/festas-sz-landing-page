import Image from 'next/image'
import Slider from 'react-infinite-logo-slider'

const SingleParceiro = ({ parceiro }: { parceiro: any }) => { 

  return (
    <Slider.Slide>
      <div className='flex items-center'>
        <Image
          src={parceiro}
          alt="parceiro-icon"
          height={50}
          width={130}
          className=''
        />
      </div>
    </Slider.Slide>
  )
}

export default SingleParceiro
