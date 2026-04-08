import { Mppx, tempo } from 'mppx/server'

export const mppx = Mppx.create({
  methods: [
    tempo.charge({
      testnet: true,
      currency: '0x20c0000000000000000000000000000000000000', // pathUSD
      recipient: (process.env.TEMPO_RECIPIENT ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
      html: true,
    }),
  ],
  secretKey: process.env.MPP_SECRET_KEY ?? 'build-placeholder',
})
