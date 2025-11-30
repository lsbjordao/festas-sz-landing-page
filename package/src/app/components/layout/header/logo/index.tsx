import Image from "next/image"
import Link from "next/link"

const Logo = () => {
    return (
        <Link href="/">
            <Image src={"/images/logo/logo.svg"} alt="logo" width={50} height={20} className="block dark:hidden w-[50px] h-auto" />
            <Image src={"/images/logo/logo-white.svg"} alt="logo" width={50} height={20} className="hidden dark:block w-[50px] h-auto" />
        </Link>
    )
}

export default Logo