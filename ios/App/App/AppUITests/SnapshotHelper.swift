import XCTest
import Foundation

func snapshot(_ name: String, testCase: XCTestCase) {
    let screenshot = XCUIScreen.main.screenshot()

    if let dir = ProcessInfo.processInfo.environment["SIMULATOR_SCREENSHOTS_DIR"] {
        let url = URL(fileURLWithPath: dir).appendingPathComponent("\(name).png")
        do {
            try screenshot.pngRepresentation.write(to: url)
            print("[snapshot] saved: \(url.path)")
        } catch {
            print("[snapshot] write error: \(error)")
        }
    } else {
        print("[snapshot] SIMULATOR_SCREENSHOTS_DIR not set")
    }

    let attachment = XCTAttachment(screenshot: screenshot)
    attachment.name = name
    attachment.lifetime = .keepAlways
    testCase.add(attachment)
}
