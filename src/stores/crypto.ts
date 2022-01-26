
import { ethers } from 'ethers'
import { acceptHMRUpdate, defineStore } from 'pinia'
import contractABI from '../artifacts/contracts/WavePortal.sol/WavePortal.json'
const contractAddress = '0xEb3B8A7bF4E853d11aD233e15438852Ac067e253'

export const useCryptoStore = defineStore('user', () => {
  const account = ref(null)
  const guestPosts = ref([] as any)
  const loading = ref(false)
  const guestPostsCount = ref(0)

  async function getBalance() {
    setLoader(true)
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer)
        const count = (await wavePortalContract.getBalance())
        const amt = ethers.utils.formatEther(count)
        console.log('count', amt)
        setLoader(false)
      }
    }
    catch (e) {
      setLoader(false)
      console.log('e', e)
    }
  }

  async function wave(messageInput) {
    console.log('setting loader')
    setLoader(true)
    try {
      console.log('got', messageInput)
      const { ethereum } = window
      if (ethereum) {
      // create provider object from ethers library, using ethereum object injected by metamask
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer)
        wavePortalContract.on('PrizeMoneySent', (receiver, amount) => {
          console.log('prize won! %s received ', receiver, amount.toNumber())
        })

        const overrides = {
          value: ethers.utils.parseEther('.05'), // sending one ether
          gasLimit: 200000, // optional
        }

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(messageInput, overrides)
        console.log('Mining...', waveTxn.hash)
        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)

        const count = (await wavePortalContract.totalWaveCount()).toNumber()
        console.log('count', count)
        messageInput = ''
        setLoader(false)
      }
      else {
        console.log('Ethereum object doesn\'t exist!')
      }
    }
    catch (error) {
      setLoader(false)
      console.log(error)
    }
  }

  async function getAllWaves() {
    try {
    // setLoading(true);
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer)

        const waves = await wavePortalContract.getAllWaves()

        /*
             * We only need address, timestamp, and message in our UI so let's
             * pick those out
             */
        const wavesCleaned = [] as any
        waves.forEach((wave) => {
          const waveTime = new Date(wave.timestamp * 1000)
          // const waveTimeFormatted = moment(waveTime).format('llll')
          // DateTime.fromFormat(waveTime, 'MM-dd-yyyy').toJSDate();
          const waveTimeFormatted = new Intl.DateTimeFormat('en-US').format(waveTime) as any

          wavesCleaned.push({
            address: wave.waver,
            timestamp: waveTimeFormatted,
            message: wave.message,
          })
        })

        // setAllWaves(wavesCleaned)
        guestPosts.value = wavesCleaned

        wavePortalContract.on('NewWave', (from, message, timestamp) => {
          console.log('NewWave', from, timestamp, message)
          const waveTime = new Date(timestamp * 1000)
          // const waveTimeFormatted = moment(waveTime).format('llll')
          const waveTimeFormatted = new Intl.DateTimeFormat('en-US').format(waveTime) as any
          guestPosts.value = [...guestPosts.value, {
            address: from,
            timestamp: waveTimeFormatted,
            message,

          }]
        })
      }
      else {
        console.log('Ethereum object doesn\'t exist!')
      }
    // setLoading(false)
    }
    catch (error) {
      console.log(error)
    }
  }

  async function getWaveCount() {
    try {
      const { ethereum } = window
      if (ethereum) {
      // create provider object from ethers library, using ethereum object injected by metamask
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer)
        const count = (await wavePortalContract.totalWaveCount())
        console.log('Retrieved total wave count...', count)
        guestPostsCount.value = count
      }
      else {
        console.log('Ethereum object doesn\'t exist!')
      }
    // setLoading(false)
    }
    catch (error) {
      console.log(error)
    }
  }

  async function connectWallet() {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert('Must connect to MetaMask!')
        return
      }
      const myAccounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected: ', myAccounts[0])
      account.value = myAccounts[0]
      await getWaveCount()
      await getAllWaves()
      await getBalance()
    }
    catch (error) {
      console.log(error)
    }
  }

  function setLoader(value: boolean) {
    console.log('setloader', value)
    loading.value = value
  }

  return {
    setLoader,
    loading,
    wave,
    connectWallet,
    account,
    guestPosts,
    guestPostsCount,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCryptoStore, import.meta.hot))
