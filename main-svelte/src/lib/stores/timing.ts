import { writable } from 'svelte/store';

export interface TimeData {
	decimalCompleted: number; // 0-1 (like original)
	hours: number;
	minutes: number;
	seconds: number;
	periodName: string;
	dayType: string;
	showVisuals: boolean;
}

const mockTimeData: TimeData = {
	decimalCompleted: 0.73, // 73% as decimal
	hours: 0,
	minutes: 5,
	seconds: 42,
	periodName: 'AP Calculus BC',
	dayType: 'Block Schedule',
	showVisuals: true
};

export const timing = writable<TimeData>(mockTimeData);

// Mock function to simulate timing updates (will be replaced by actual timing engine)
export function startMockTimingLoop() {
	let progress = 0.73;
	
	setInterval(() => {
		// Simulate slow progress increment
		progress += 0.001; // Small decimal increment
		if (progress > 1) progress = 0;
		
		// Update mock seconds countdown
		const totalSeconds = Math.floor((1 - progress) * 3600); // Mock: assume 3600 seconds total
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		
		timing.update(data => ({
			...data,
			decimalCompleted: progress,
			minutes,
			seconds
		}));
	}, 1000); // Update every second
}

// Function to update timing data (will be called by actual timing engine)
export function updateTiming(newData: Partial<TimeData>) {
	timing.update(data => ({
		...data,
		...newData
	}));
}