package metrics

import (
	"fmt"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
)

// SystemMetrics holds system performance metrics
type SystemMetrics struct {
	CPU    CPUMetrics    `json:"cpu"`
	Memory MemoryMetrics `json:"memory"`
}

// CPUMetrics holds CPU usage information
type CPUMetrics struct {
	UsagePercent float64 `json:"usage_percent"`
	Cores        int32   `json:"cores"`
	LogicalCores int32   `json:"logical_cores"`
}

// MemoryMetrics holds memory usage information
type MemoryMetrics struct {
	Total       uint64  `json:"total_bytes"`
	Available   uint64  `json:"available_bytes"`
	Used        uint64  `json:"used_bytes"`
	UsedPercent float64 `json:"used_percent"`
	Free        uint64  `json:"free_bytes"`
}

// GetSystemMetrics retrieves current system metrics
func GetSystemMetrics() (*SystemMetrics, error) {
	// Get CPU metrics
	cpuMetrics, err := getCPUMetrics()
	if err != nil {
		return nil, fmt.Errorf("failed to get CPU metrics: %w", err)
	}

	// Get memory metrics
	memMetrics, err := getMemoryMetrics()
	if err != nil {
		return nil, fmt.Errorf("failed to get memory metrics: %w", err)
	}

	return &SystemMetrics{
		CPU:    cpuMetrics,
		Memory: memMetrics,
	}, nil
}

// getCPUMetrics retrieves CPU usage and core information
func getCPUMetrics() (CPUMetrics, error) {
	cpuMetrics := CPUMetrics{}

	// Get CPU usage percentage
	cpuPercent, err := cpu.Percent(0, false)
	if err != nil {
		return cpuMetrics, err
	}

	if len(cpuPercent) > 0 {
		cpuMetrics.UsagePercent = cpuPercent[0]
	}

	// Get number of physical cores
	physicalCores, err := cpu.Counts(false)
	if err != nil {
		return cpuMetrics, err
	}
	cpuMetrics.Cores = int32(physicalCores)

	// Get number of logical cores
	logicalCores, err := cpu.Counts(true)
	if err != nil {
		return cpuMetrics, err
	}
	cpuMetrics.LogicalCores = int32(logicalCores)

	return cpuMetrics, nil
}

// getMemoryMetrics retrieves memory usage information
func getMemoryMetrics() (MemoryMetrics, error) {
	memMetrics := MemoryMetrics{}

	vmStat, err := mem.VirtualMemory()
	if err != nil {
		return memMetrics, err
	}

	memMetrics.Total = vmStat.Total
	memMetrics.Available = vmStat.Available
	memMetrics.Used = vmStat.Used
	memMetrics.UsedPercent = vmStat.UsedPercent
	memMetrics.Free = vmStat.Free

	return memMetrics, nil
}

// FormatMetrics returns a formatted string representation of metrics
func FormatMetrics(metrics *SystemMetrics) string {
	return fmt.Sprintf(
		"CPU Usage: %.2f%% | Memory: %.2f%% (%d MB / %d MB)",
		metrics.CPU.UsagePercent,
		metrics.Memory.UsedPercent,
		metrics.Memory.Used/1024/1024,
		metrics.Memory.Total/1024/1024,
	)
}
