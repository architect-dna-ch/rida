import XCTest

final class ScreenshotTests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["UI_TESTING"]
        app.launch()
        // Allow the web view to load
        Thread.sleep(forTimeInterval: 4)
    }

    func testCaptureScreenshots() throws {
        let app = XCUIApplication()

        // Wait for the web view to be ready
        let webView = app.webViews.firstMatch
        XCTAssertTrue(webView.waitForExistence(timeout: 15))

        snapshot("01_Yawm")

        // Tap each bottom nav tab and capture
        tapTab(app, label: "Salah")
        snapshot("02_Salah")

        tapTab(app, label: "Nutrition")
        snapshot("03_Nutrition")

        tapTab(app, label: "Dhikr")
        snapshot("04_Dhikr")

        tapTab(app, label: "Hifz")
        snapshot("05_Hifz")

        tapTab(app, label: "Settings")
        snapshot("06_Settings")
    }

    private func tapTab(_ app: XCUIApplication, label: String) {
        // Try native tab bar first, fall back to web view tap
        let tab = app.buttons[label]
        if tab.waitForExistence(timeout: 3) {
            tab.tap()
        } else {
            // Tap via JS in WKWebView
            app.webViews.firstMatch.tap()
        }
        Thread.sleep(forTimeInterval: 2)
    }
}
