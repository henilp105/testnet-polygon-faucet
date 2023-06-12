import React from 'react'

const PolygonScan = ({
  address,
  tx,
  short,
}) => {
  return (
    <a
      href={`https://mumbai.polygonscan.com/${tx ? 'tx' : 'address'}/${tx ? tx : address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purple-600 dark:text-lime-400 w-16 md:w-auto truncate"
      style={{ textDecoration: 'none', color: '#7B3FE4' }}
    >
      {tx
        ? short
          ? tx.substring(0, 15) + '...'
          : tx
        : short && address
        ? address.substring(0, 10) + '...'
        : address}
    </a>
  )
}
export default PolygonScan
