import useGetLogo from '@/hooks/useGetLogo'

const ScreenSplash = () => {
  const logo = useGetLogo('icon')
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      role="status"
      aria-label="Carregando aplicação"
    >
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="size-20 animate-pulse object-contain opacity-90"
      />
    </div>
  )
}

export default ScreenSplash
