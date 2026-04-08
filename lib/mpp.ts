import { Mppx, tempo } from 'mppx/server'

export const mppx = Mppx.create({
  methods: [
    tempo.charge({
      testnet: false,
      currency: '0x20c000000000000000000000b9537d11c60e8b50', // USDC.e (tempo mainnet)
      recipient: (process.env.TEMPO_RECIPIENT ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
      html: true,
    }),
  ],
  secretKey: process.env.MPP_SECRET_KEY ?? 'build-placeholder',
})
