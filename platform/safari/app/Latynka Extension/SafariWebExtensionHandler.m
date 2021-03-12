#import "SafariWebExtensionHandler.h"
#import <SafariServices/SafariServices.h>

#if __MAC_OS_X_VERSION_MIN_REQUIRED < 110000
NSString * const SFExtensionMessageKey = @"message";
#endif


@implementation SafariWebExtensionHandler

- (void)beginRequestWithExtensionContext:(NSExtensionContext *)context
{
    [context completeRequestReturningItems:nil completionHandler:nil];
}

@end
