#import "ExtensionGuideViewController.h"


@interface ExtensionGuideViewController () <UIPageViewControllerDelegate, UIPageViewControllerDataSource>

@property (strong, nonatomic) NSArray<UIViewController*>* pages;

@end


@implementation ExtensionGuideViewController

- (void)awakeFromNib {
    [super awakeFromNib];

    NSUInteger totalPages = 5;
    NSMutableArray* pages = [NSMutableArray arrayWithCapacity:totalPages];
    for (NSInteger i = 0; i < totalPages; ++i) {
        NSString* nextId = [NSString stringWithFormat:@"guide_page%ld", i];
        UIViewController* page = [self.storyboard instantiateViewControllerWithIdentifier:nextId];
        [pages addObject:page];
    }
    self.pages = pages;

    self.delegate = self;
    self.dataSource = self;
    
    [self setViewControllers:@[pages.firstObject] direction:(UIPageViewControllerNavigationDirectionForward) animated:NO completion:nil];
}

- (void)viewDidLoad {
    [super viewDidLoad];
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController viewControllerAfterViewController:(UIViewController *)viewController {
    NSInteger index = [self.pages indexOfObject:viewController];
    if (index != NSNotFound && index+1 < self.pages.count) {
        return self.pages[index + 1];
    }
    return nil;
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController viewControllerBeforeViewController:(UIViewController *)viewController {
    NSInteger index = [self.pages indexOfObject:viewController];
    if (index != NSNotFound && index > 0) {
        return self.pages[index - 1];
    }
    return nil;
}

- (NSInteger)presentationCountForPageViewController:(UIPageViewController *)pageViewController {
    return self.pages.count;
}

- (NSInteger)presentationIndexForPageViewController:(UIPageViewController *)pageViewController {
    UIViewController* page = pageViewController.childViewControllers.firstObject;
    NSInteger index = [self.pages indexOfObject:page];
    return index;
}

@end
