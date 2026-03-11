package restart

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
	"time"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/watcher"
)

// RestartManager manages server restart on code changes
type RestartManager struct {
	watcher *watcher.FileWatcher
	cmd     *exec.Cmd
	done    chan bool
}

// NewRestartManager creates a new restart manager
func NewRestartManager(watchDir string) *RestartManager {
	return &RestartManager{
		done: make(chan bool),
	}
}

// StartWatching starts watching for file changes and restarts the server
func (rm *RestartManager) StartWatching(watchDir string, buildCmd string, runCmd string) error {
	onChange := func() {
		utils.InfoLog("Code changes detected, rebuilding...")
		rm.restartServer(buildCmd, runCmd)
	}

	fw := watcher.NewFileWatcher(watchDir, onChange)
	rm.watcher = fw

	if err := fw.Start(1 * time.Second); err != nil {
		return fmt.Errorf("failed to start file watcher: %w", err)
	}

	utils.SuccessLog("File watcher started, watching for changes in %s", watchDir)
	return nil
}

// restartServer stops the current server process and starts a new one
func (rm *RestartManager) restartServer(buildCmd string, runCmd string) {
	// Kill previous process
	if rm.cmd != nil && rm.cmd.Process != nil {
		utils.WarnLog("Killing previous process...")
		_ = rm.cmd.Process.Kill()
		_ = rm.cmd.Wait()
		time.Sleep(500 * time.Millisecond)
	}

	// Rebuild
	utils.InfoLog("Rebuilding application...")
	rebuildCmd := exec.Command("sh", "-c", buildCmd)
	rebuildCmd.Stdout = os.Stdout
	rebuildCmd.Stderr = os.Stderr

	if err := rebuildCmd.Run(); err != nil {
		utils.ErrorLog("Build failed: %s", err)
		return
	}

	utils.SuccessLog("Build successful")

	// Start new process
	utils.InfoLog("Starting server...")
	rm.cmd = exec.Command("sh", "-c", runCmd)
	rm.cmd.Stdout = os.Stdout
	rm.cmd.Stderr = os.Stderr

	if err := rm.cmd.Start(); err != nil {
		utils.ErrorLog("Failed to start server: %s", err)
		return
	}

	utils.SuccessLog("Server started with PID %d", rm.cmd.Process.Pid)
}

// Stop stops the watcher and the server process
func (rm *RestartManager) Stop() {
	if rm.watcher != nil && rm.watcher.IsRunning() {
		utils.InfoLog("Stopping file watcher...")
		rm.watcher.Stop()
	}

	if rm.cmd != nil && rm.cmd.Process != nil {
		utils.InfoLog("Stopping server process...")
		_ = rm.cmd.Process.Kill()
		_ = rm.cmd.Wait()
	}
}

// WaitForSignal blocks until SIGINT or SIGTERM is received
func (rm *RestartManager) WaitForSignal() {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan
	utils.InfoLog("Received shutdown signal")
	rm.Stop()
}
