package watcher

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// FileWatcher watches for file changes in the project
type FileWatcher struct {
	watchDir     string
	watchedFiles map[string]time.Time
	ignoreDirs   map[string]bool
	ignoreExts   map[string]bool
	onChange     func()
	stopChan     chan bool
	running      bool
}

// NewFileWatcher creates a new file watcher instance
func NewFileWatcher(watchDir string, onChange func()) *FileWatcher {
	return &FileWatcher{
		watchDir:     watchDir,
		watchedFiles: make(map[string]time.Time),
		stopChan:     make(chan bool),
		onChange:     onChange,
		ignoreDirs: map[string]bool{
			".git":         true,
			".setting":     true,
			"node_modules": true,
			"vendor":       true,
			".vscode":      true,
			".idea":        true,
		},
		ignoreExts: map[string]bool{
			".mod": true,
			".sum": true,
			".exe": true,
			".tmp": true,
		},
	}
}

// Start begins watching for file changes
func (fw *FileWatcher) Start(interval time.Duration) error {
	fw.running = true

	// Initial scan of watched directory
	if err := fw.scanDirectory(); err != nil {
		return fmt.Errorf("initial scan failed: %w", err)
	}

	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				if changed, _ := fw.checkChanges(); changed {
					fw.onChange()
				}
			case <-fw.stopChan:
				fw.running = false
				return
			}
		}
	}()

	return nil
}

// Stop stops the file watcher
func (fw *FileWatcher) Stop() {
	if fw.running {
		fw.stopChan <- true
	}
}

// scanDirectory scans the watch directory and initializes file timestamps
func (fw *FileWatcher) scanDirectory() error {
	return filepath.Walk(fw.watchDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip ignored directories
		if info.IsDir() && fw.ignoreDirs[info.Name()] {
			return filepath.SkipDir
		}

		// Skip ignored extensions
		if !info.IsDir() {
			ext := filepath.Ext(path)
			if fw.ignoreExts[ext] {
				return nil
			}

			// Only watch .go files
			if ext != ".go" {
				return nil
			}

			fw.watchedFiles[path] = info.ModTime()
		}

		return nil
	})
}

// checkChanges checks if any watched files have changed
func (fw *FileWatcher) checkChanges() (bool, error) {
	changed := false

	// Check existing files
	for path, oldTime := range fw.watchedFiles {
		info, err := os.Stat(path)
		if err != nil {
			if os.IsNotExist(err) {
				delete(fw.watchedFiles, path)
				changed = true
				continue
			}
			return false, err
		}

		if info.ModTime().After(oldTime) {
			fw.watchedFiles[path] = info.ModTime()
			changed = true
		}
	}

	// Check for new files
	err := filepath.Walk(fw.watchDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() && fw.ignoreDirs[info.Name()] {
			return filepath.SkipDir
		}

		if !info.IsDir() {
			ext := filepath.Ext(path)
			if ext != ".go" || fw.ignoreExts[ext] {
				return nil
			}

			if _, exists := fw.watchedFiles[path]; !exists {
				fw.watchedFiles[path] = info.ModTime()
				changed = true
			}
		}

		return nil
	})

	return changed, err
}

// IsRunning returns whether the watcher is currently running
func (fw *FileWatcher) IsRunning() bool {
	return fw.running
}
