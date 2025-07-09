
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
				'caveat': ['Caveat', 'cursive'],
				'dancing': ['Dancing Script', 'cursive'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				baby: {
					blue: '#A7C7E7',
					pink: '#FFB6C1',
					mint: '#c5e8c8',
					lavender: '#E6E6FA',
					yellow: '#FFFFE0',
					cream: '#FFFDD0',
					primary: 'hsl(var(--baby-primary))',
					secondary: 'hsl(var(--baby-secondary))',
					tertiary: 'hsl(var(--baby-tertiary))',
					neutral: 'hsl(var(--baby-neutral))',
					dark: 'hsl(var(--baby-dark))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'magic-float': 'magicFloat 4s ease-in-out infinite',
				'bounce-slow': 'bounce 2s infinite',
				'pulse-soft': 'pulse 3s ease-in-out infinite',
				'gentle-pulse': 'gentlePulse 3s ease-in-out infinite',
				'slide-up': 'slideUp 0.6s ease-out',
				'fade-in-up': 'fadeInUp 0.8s ease-out',
				'sparkle': 'sparkle 2s ease-in-out infinite',
				'rainbow-shift': 'rainbowShift 3s linear infinite',
				'magic-glow': 'magicGlow 2s ease-in-out infinite',
				'heartbeat': 'heartbeat 2s ease-in-out infinite'
			},
			boxShadow: {
				'soft': '0 8px 32px rgba(0, 0, 0, 0.08)',
				'glow': '0 0 60px hsl(var(--primary) / 0.3)',
				'accent-glow': '0 0 50px hsl(var(--accent) / 0.35)',
				'secondary-glow': '0 0 40px hsl(var(--secondary) / 0.25)',
				'magic': '0 0 80px hsl(var(--primary) / 0.4), 0 20px 40px hsl(var(--primary) / 0.1)',
				'dreamy': '0 0 100px hsl(var(--primary) / 0.2), 0 0 60px hsl(var(--secondary) / 0.15), 0 0 40px hsl(var(--accent) / 0.1)',
				'float': '0 10px 30px hsl(var(--primary) / 0.15)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
