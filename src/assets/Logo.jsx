import React from 'react';

const Logo = ({className = "h-8 sm:h-10" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200"
      className={className}
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <filter id="shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" />

      <g transform="translate(100,100)" filter="url(#shadow)">
        <circle cx="0" cy="0" r="35" fill="#FFF" />
        <path
          d="M-15,-10 Q-12,-15 -9,-10"
          stroke="#3B82F6"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M9,-10 Q12,-15 15,-10"
          stroke="#3B82F6"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M-20,5 Q0,25 20,5"
          stroke="#3B82F6"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <g transform="translate(100,100)">
        <g transform="translate(0,-50)" filter="url(#shadow)">
          <circle cx="0" cy="0" r="25" fill="#FFF" />
          <path
            d="M-10,-5 Q-8,-8 -6,-5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6,-5 Q8,-8 10,-5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-12,5 Q0,15 12,5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        <g transform="translate(43,25)" filter="url(#shadow)">
          <circle cx="0" cy="0" r="25" fill="#FFF" />
          <path
            d="M-10,-5 Q-8,-8 -6,-5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6,-5 Q8,-8 10,-5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-12,5 Q0,15 12,5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        <g transform="translate(-43,25)" filter="url(#shadow)">
          <circle cx="0" cy="0" r="25" fill="#FFF" />
          <path
            d="M-10,-5 Q-8,-8 -6,-5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6,-5 Q8,-8 10,-5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-12,5 Q0,15 12,5"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>

      <g
        transform="translate(100,100)"
        stroke="#FFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      >
        <path d="M0,-35 L0,-25" />
        <path d="M30,17 L18,25" />
        <path d="M-30,17 L-18,25" />
      </g>
    </svg>
  );
}

export default Logo;