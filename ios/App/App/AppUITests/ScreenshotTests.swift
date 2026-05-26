import XCTest

final class ScreenshotTests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["UI_TESTING"]
        app.launch()
        Thread.sleep(forTimeInterval: 4)
    }

    func testCaptureScreenshots() throws {
        let app = XCUIApplication()
        let webView = app.webViews.firstMatch
        XCTAssertTrue(webView.waitForExistence(timeout: 15))

        snapshot("01_Yawm", testCase: self)

        tapTab(app, label: "Salah")
        snapshot("02_Salah", testCase: self)

        tapTab(app, label: "Nutrition")
        snapshot("03_Nutrition", testCase: self)

        tapTab(app, label: "Dhikr")
        snapshot("04_Dhikr", testCase: self)

        tapTab(app, label: "Hifz")
        snapshot("05_Hifz", testCase: self)

        tapTab(app, label: "Settings")
        snapshot("06_Settings", testCase: self)
    }

    private func tapTab(_ app: XCUIApplication, label: String) {
        let tab = app.buttons[label]
        if tab.waitForExistence(timeout: 3) {
            tab.tap()
        } else {
            app.webViews.firstMatch.tap()
        }
        Thread.sleep(forTimeInterval: 2)
    }
}
