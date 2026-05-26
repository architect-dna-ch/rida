// Minimal snapshot helper — saves screenshots to SIMULATOR_SCREENSHOTS_DIR or temp
import XCTest
import Foundation

func snapshot(_ name: String, waitForLoadingIndicator: Bool = true) {
    let screenshot = XCUIScreen.main.screenshot()
    let dir = ProcessInfo.processInfo.environment["SIMULATOR_SCREENSHOTS_DIR"]
        ?? NSTemporaryDirectory()
    let url = URL(fileURLWithPath: dir).appendingPathComponent("\(name).png")
    try? screenshot.pngRepresentation.write(to: url)
    XCTAttachment(screenshot: screenshot).lifetime = .keepAlways
    print("[snapshot] saved: \(url.path)")
}
